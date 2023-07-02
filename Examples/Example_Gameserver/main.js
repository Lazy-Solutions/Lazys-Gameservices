import GameServerCore from "gameserver_core";
import { v4 as uuidv4 } from 'uuid';

// Maintain a set to store generated GUIDs
const generatedGUIDs = new Set();
const isDev = process.env.NODE_ENV === 'development';

function generateGUID() {
    let guid;
    do {
        guid = uuidv4().substring(0, 6);
    } while (generatedGUIDs.has(guid));

    generatedGUIDs.add(guid);
    return guid;
}

// Define the configuration object
const config = {
    API_PORT: process.env.API_PORT || 9000,
    SOCKET_PORT: process.env.SOCKET_PORT || 9001,

    OnUserIdCreation: async (ws, req) => {
        return req.headers['user-id'];
    },
    OnClientConnect: async (userId, ws) => {
        console.log('Client connected:' + userId);
        // Custom logic for handling client connection
    },
    OnClientDisconnect: async (userId) => {
        console.log('Client disconnected');
        // Custom logic for handling client disconnection
    },
    OnMessageReceived: async (message, userId) => {
        console.log('Received message:', message);
        // Custom logic for handling received messages
    },
    OnError: (error) => {
        console.log('Error:', error);
        // Custom logic for handling errors
    },
    OnCreateGameAction: () => {
        // this example generates a 6 fig code.
        const match = generateGUID();
        return match;
    },
};

// Initialize the game server core
const server = GameServerCore(config);