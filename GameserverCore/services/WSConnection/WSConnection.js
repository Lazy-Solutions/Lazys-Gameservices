import { createServer } from 'https';
//import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

// Validate the configuration object
function validateConfig(config, requiredProps) {
    for (const prop of requiredProps) {
        if (!config || !config[prop]) {
            throw new Error(`Incomplete configuration. Missing property: ${prop}`);
        }
    }
}


/**
 * Initializes the WebSocket server with the provided configuration.
 * @param {Object} settings - The configuration object.
 * @param {number} settings.port - The port number for the WebSocket server.
 * @param {function} settings.OnUserIdCreation - The callback function to handle user ID creation.
 * @param {function} settings.OnClientConnect - The callback function to handle client connection.
 * @param {function} settings.OnMessageReceived - The callback function to handle received messages.
 * @param {function} settings.OnClientDisconnect - The callback function to handle client disconnection.
 * @param {function} settings.OnError - The callback function to handle errors.
 */
export default function WSConnection(settings) {
    validateConfig(settings, ['port', 'OnUserIdCreation', 'OnClientConnect', 'OnClientDisconnect', 'OnMessageReceived', 'OnError']);

    const { port, OnUserIdCreation, OnClientConnect, OnClientDisconnect, OnMessageReceived, OnError } = settings;

    const server = createServer({
        //cert: readFileSync('/path/to/cert.pem'),
        //key: readFileSync('/path/to/key.pem')
    });

    const wss = new WebSocketServer({ port }, () => console.log('started'));

    wss.on('connection', async (ws, request) => {

        const userId = OnUserIdCreation(ws, request);

        await OnClientConnect(userId, ws);

        ws.on('message', async (message) => {
            if (!ws.OPEN) {
                res.status(401).send('Not Connected');
                return;
            }
            if (!req.is('application/json')) { // Check that the request is JSON
                res.status(400).send('Invalid request format');
                return;
            }

            try {
                await OnMessageReceived(JSON.parse(message), userId);
            }
            catch (e) {
                console.log('invalid format: ' + e);
            }
        });

        ws.on('close', async () => {
            await OnClientDisconnect(userId);
        });

        ws.on('error', OnError);
    });
}













