import compression from 'compression';

// Shared
import Api from '@lazy/shared/services/Api.js';
import ConfigManager from '@lazy/shared/services/ConfigManager.js';
import { Authentication } from '@lazy/shared/services/Authentication.js';
import { generatePlayer } from '@lazy/shared/models/Player.js';
import { validateObject, validateFields } from '@lazy/shared/utils/ValidateUtils.js';

// Project
import Matchmaking from './services/Matchmaking.js';
import { MatchingLogicByRandom } from './services/MatchingLogics.js';
import { joinMatchQueue, leaveMatchQueue, privateMatch, getMatch } from './apiRoutes/apiRoutes.js';

/**
 * Matchmaking core
 * @description Represents the configuration settings for the Matchmaking system.
 * @param {Object} config - The configuration options.
 * @param {number} [config.port=8080] - The port number for the Matchmaking server.
 * @param {number} [config.lobbySize=5] - The maximum number of players allowed in a match.
 * @param {Array} [config.servers=[]] - The data for each server. { ip, ws_port, api_port }
 * @param {Function} [config.matchingLogic=MatchingLogicByRandom] - The custom matching logic function.
 * @param {Function} [config.generatePlayer=generatePlayer] - The custom player generation function.
 * @param {Function} [config.authentication=()=>true] - To disable auth, use default, or return true.
 */

export default function MatchmakingCore(config)
{
    if (!config)
    {
        console.warn('No config set for Matchmaking. Using default.');
    }

    const reconfig = new ConfigTemplate(config);

    // make sure all required are added
    validateFields(reconfig, ['port', 'lobbySize', 'servers']);

    // make sure all the values in the config is valid
    validateObject(reconfig, new ConfigTemplate({}));

    ConfigManager.set(config);

    const { port, authentication, customEndpoints, serverOptions } = config;

    const baseEndpoints = [
        { endpoint: "/match/:player_id", method: 'get', callback: getMatch },
        { endpoint: "/private/:match_id", method: 'get', callback: privateMatch },
        { endpoint: "/private", method: 'get', callback: privateMatch },
        { endpoint: "/join", method: 'post', callback: joinMatchQueue },
        { endpoint: "/leave", method: 'post', callback: leaveMatchQueue },
    ];

    const endpoints = [
        ...baseEndpoints.map(endpoint => ({
            ...endpoint,
            method: endpoint.method.toLowerCase()
        })),
        ...customEndpoints.map(endpoint => ({
            ...endpoint,
            method: endpoint.method.toLowerCase()
        }))
    ];

    const mapendpoints = new Set(endpoints.map(ep => ep.endpoint));

    if (mapendpoints.size !== endpoints.length)
    {
        throw new Error(`Endpoints have duplicate values, ${baseEndpoints.map(ep => ep.endpoint)} are reserved. `);
    }


    // TODO: improve
    const Errorhandler = (err, req, res, next) =>
    {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err)
        { // TODO: might want to make this custom
            res.status(400).json({ error: 'Bad Request - Invalid JSON' });
        } else if (err instanceof CustomError && err.code === ErrorCode.AUTH_FAILED)
        {
            res.status(401).json(err.get());
        } else
        {
            console.error(err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    };

    const middleware = [
        compression(),
        Authentication(authentication),
        Errorhandler
    ];

    const api = Api(port, endpoints, middleware, serverOptions);
    const matchmaking = Matchmaking();

    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);

    function stop()
    {
        if (api)
        {
            api.close();
            matchmaking.stop();
        }

        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }

    return {
        stop,
        api,
        matchmaking
    };
}

class ConfigTemplate
{
    constructor(config)
    {
        // required
        this.port = config.port || 8080;
        this.lobbySize = config.lobbySize || 5;
        this.servers = config.servers || (() => []);
        //optional
        this.matchingLogic = config.matchingLogic || MatchingLogicByRandom;
        this.generatePlayer = config.generatePlayer || generatePlayer;
        this.authentication = config.authentication || ((req, res) => true);
        this.customEndpoints = config.customEndpoints || (() => []);
        this.serverOptions = config.serverOptions || {};
    }
}
