import WSConnection from './services/WSConnection/WSConnection.js';
import Api from './api.js';
// import publicIp from 'public-ip';

// Validate the configuration object
function validateConfig(config, requiredProps) {
    for (const prop of requiredProps) {
        if (!config || !config[prop]) {
            throw new Error(`Incomplete configuration. Missing property: ${prop}`);
        }
    }
}

/**
 * Initializes the game server core with the provided configuration.
 * 
 * Example usage:
 * ```javascript
 * const config = {
 *   API_PORT: 3000,
 *   SOCKET_PORT: 4000,
 *   OnClientConnect: (id, ws) => {
 *     console.log('Handle client connection here.');
 *   },
 *   OnClientDisconnect: (userId) => {
 *     console.log('Handle client disconnection here.');
 *   },
 *   OnMessageReceived: (msg, userId) => {
 *     console.log('Handle received messages here.');
 *   },
 *   createGameEndpoint: () => {
 *      const serverIP = isDev ? '127.0.0.1' : "await publicIp.v4()";
        const SOCKET_PORT = config.SOCKET_PORT; 

        return {
            code: generateGUID(),
            server: `ws://${serverIP}:${SOCKET_PORT}`
        };
 *   }),
 * };
 * ```
 * 
 * @param {Object} config - The configuration object.
 * @param {number} config.API_PORT - The port number for the API.
 * @param {number} config.SOCKET_PORT - The port number for the WebSocket server.
 * @param {function} config.OnClientConnect - The callback function to handle client connection.
 * @param {function} config.OnClientDisconnect - The callback function to handle client disconnection.
 * @param {function} config.OnMessageReceived - The callback function to handle received messages.
 * @param {string} config.OnCreateGameAction - The API endpoint for creating a new game and returning a new match.

 */
export default function GameServerCore(config) {
    validateConfig(config, ['API_PORT', 'SOCKET_PORT', 'OnClientConnect', 'OnClientDisconnect', 'OnMessageReceived', 'OnCreateGameAction', 'OnError']);

    const { API_PORT, SOCKET_PORT, OnUserIdCreation, OnClientConnect, OnClientDisconnect, OnMessageReceived, OnCreateGameAction, OnError } = config;

    // Initialize the API
    const _Api = Api({
        port: API_PORT,
        OnCreateGameAction,
    });

    // Initialize the game server
    const _WSConnection = WSConnection({
        port: SOCKET_PORT,
        OnUserIdCreation,
        OnClientConnect,
        OnMessageReceived,
        OnClientDisconnect,
        OnError
    });

    function stop() {}

    return {
        stop,
    }
}
