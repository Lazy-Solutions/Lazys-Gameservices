import { MatchingLogicByMmr } from '../services/MatchingLogics.js';
import { generatePlayer } from '../models/Player.js';

/**
 * @description Represents the configuration settings for the Matchmaking system.
 * @param {Object} config - The configuration options.
 * @param {number} [config.port=8080] - The port number for the Matchmaking server.
 * @param {number} [config.lobbySize=5] - The maximum number of players allowed in a match.
 * @param {Array} [config.servers=[]] - The data for each server. { ip, ws_port, api_port }
 * @param {Function} [config.matchingLogic=MatchingLogicByMmr] - The custom matching logic function.
 * @param {Function} [config.generatePlayer=generatePlayer] - The custom player generation function.
 * @param {Function} [config.authentication=()=>true] - To disable auth, use default, or return true.
 */
export default class Config {
    constructor(config) {
        this.port = config.port || 8080;
        this.lobbySize = config.lobbySize || 5;
        this.servers = config.servers || (() => []);
        this.matchingLogic = config.matchingLogic || MatchingLogicByMmr;
        this.generatePlayer = config.generatePlayer || generatePlayer;
        this.authentication = config.authentication || (() => true);
    }
}
  