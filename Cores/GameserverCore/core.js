import compression from 'compression';
// SHARED
import Api from '@lazy/shared/services/Api.js';
import ConfigManager from '@lazy/shared/services/ConfigManager.js';
import CustomError from '@lazy/shared/common/CustomError.js';
import ErrorCode from '@lazy/shared/common/ErrorCodes.js';
import { Authentication } from '@lazy/shared/services/Authentication.js';
import { validateObject, validateFields } from '@lazy/shared/utils/ValidateUtils.js';

// Project
import WSConnection from './services/WSConnection/WSConnection.js';
import { match } from './apiRoutes/apiRoutes.js';

/**
 * Gameserver Core
 *
 * Initializes the Gameserver Core with the provided configuration.
 *
 * @param {Config} config - The configuration object of type 'Config' for the Gameserver Core.
 * @returns {Object} An object with the following properties:
 *   - {Function} stop - A function to stop the Gameserver Core and clean up resources.
 *   - {Object} api - An object with a `stop()` function to stop the API, if needed.
 *   - {Object} wsConnection - An object with a `stop()` function to stop the WebSocket connection, if needed.
 */
export default function GameserverCore(config)
{
    if (!config)
    {
        console.warn('No config set for Matchmaking. Using default.');
    }

    const reconfig = new Config(config);

    validateFields(reconfig, ['port', 'OnClientConnect', 'OnClientDisconnect', 'OnMessageReceived', 'OnCreateGameAction', 'OnUserIdCreation']);

    validateObject(reconfig, new Config({}));

    ConfigManager.set(config);

    const { port, customEndpoints, serverOptions, authentication } = config;

    const baseEndpoints = [
        { endpoint: "/match", method: 'get', callback: match }
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

    // Initialize the API
    const api = Api(port, endpoints, middleware, serverOptions);

    // Initialize the game server
    const wsConnection = WSConnection(api.server, config);

    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);


    function stop()
    {
        if (api)
        {
            wsConnection.close();
            api.close();
        }

        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }

    return {
        stop,
        api, // in case we want to stop them?
        wsConnection
    };
}

/**
 * TODO: this should prob be improved
 * @typedef {Object} req
 * @typedef {Object} res
 */

/**
 * Represents the configuration for a server.
 */
class Config
{
    /**
   * Create a new Config instance.
   * Non-optional fields is needed for you to build your logic.
   * Optional can be left alone if you dont need auth, endpoints, SSL etc.
   * 
   *
   * @param {Object | undefined} config - The configuration object.
   * @param {Object} config
   * @param {number} [config.port=8080] - The port number to listen on (optional, default is 8080).
   * @param {function(number, WebSocket): void} config.OnClientConnect - Callback for client connection.
   * @param {function(number): void} config.OnClientDisconnect - Callback for client disconnection.
   * @param {function(string, number): void} config.OnMessageReceived - Callback for message received.
   * @param {function(WebSocket, req): string} config.OnUserIdCreation - Callback for generating a user ID.
   * @param {function(number, WebSocket): boolean} config.OnCreateGameAction - Callback for creating a game action.
   * @param {Array<object>} [config.customEndpoints=[]] - Callback for custom endpoints (optional).
   * @param {function(req, res): boolean} [config.authentication=()=>true] - Callback for authentication (optional).
   * @param {Object} [config.serverOptions={}] - Additional server options (optional).
   */
    constructor(config)
    {
        this.port = config.port || 8080;
        this.OnClientConnect = config.OnClientConnect || ((userId, ws) => { });
        this.OnClientDisconnect = config.OnClientDisconnect || ((userId) => { });
        this.OnMessageReceived = config.OnMessageReceived || ((message, userId) => { });
        this.OnUserIdCreation = config.OnUserIdCreation || ((ws, req) => "id");
        this.OnCreateGameAction = config.OnCreateGameAction || ((userId, ws) => true);
        this.customEndpoints = config.customEndpoints || [];
        this.authentication = config.authentication || ((req, res) => true);
        this.serverOptions = config.serverOptions || {};
    }
}

