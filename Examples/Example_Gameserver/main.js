import { readFileSync } from 'fs';

import { GameserverCore, Common } from "./core/bundle.js";
import { v4 as uuidv4 } from 'uuid';
import S3 from './S3/S3.js';
import dotenv from 'dotenv';
dotenv.config();

const { getLocalIpAddress } = Common;

// Maintain a set to store generated GUIDs
const generatedGUIDs = new Set();
const isDev = process.env.NODE_ENV === 'development';
const HOSTNAME = process.env.HOSTNAME;
const IP = getLocalIpAddress('eth0'); // TODO: check aws
const PORT = 8080;

// Register our service for AWS S3, this way we can have our servers find eachother
// You can use other means to connect the servers
const params = {
    bucketName: process.env.GAME,
    bucketKey: 'Gameserver',
    ENABLE_AWS: !isDev,
    AWS_REGION: 'eu-west-3' // paris?
};

// AWS S3 setup. you can make your own if needed. basic idea is that this will enable discoverability cross servers
const Storage = await S3(params);
await Storage.add(HOSTNAME, { ip: IP, port: PORT });

let _matchmaking;
// should be ready before we need it. but just in case we await it. MM should be one of the first to register.
const Matchmaking = async () => (_matchmaking) ? _matchmaking : async () =>
{
    do
    {
        _matchmaking = await Storage.getData('Matchmaking')?.[0];
    }
    while (!_matchmaking);
    return _matchmaking;
};

// generates a 6 fig guid, 
// TODO: add delete old guis
function generateGUID()
{
    let guid;
    do
    {
        guid = uuidv4().substring(0, 6);
    }
    while (generatedGUIDs.has(guid));

    generatedGUIDs.add(guid);
    return guid;
}

// custom endpoints is for the api. if you want other functionality
function endpoints()
{
    return [
        {
            endpoint: '/test',
            method: 'get',
            callback: (req, res) => 
            {
                console.log(`Hello from test`);
            }
        },
    ];
}

async function authentication(req, res)
{
    // if it has an upgrade, and reached this point, it has connected to the websocket. auth the user.
    if (req.headers.upgrade) 
    {
        // handle WS auth 
        // TODO: add google
        return true;
    }

    // handle api auth,
    // with AWS you can set protocol blocks for https/ so api become private. 
    // in case you do not want to use that. you can create other IP dictionarys and block etc. 

    return true;
}

// Read SSL/TLS certificate and key files, change this to change the location of the certs.
// if you really want to run without certs, leave blank
const serverOptions = {
    key: readFileSync('data/private.key'),
    cert: readFileSync('data/certificate.crt')
};


// Define the configuration object
const config = {
    port: PORT,
    OnUserIdCreation: async (ws, req) =>
    {
        return req.headers['user-id'];
    },
    OnClientConnect: async (userId, ws) =>
    {
        console.log('Client connected:' + userId);
        // Custom logic for handling client connection
    },
    OnClientDisconnect: async (userId) =>
    {
        console.log('Client disconnected');
        // Custom logic for handling client disconnection
    },
    OnMessageReceived: async (message, userId) =>
    {
        console.log('Received message:', message);
        // Custom logic for handling received messages
    },
    OnCreateGameAction: (privateMatch) =>
    {
        // this example generates a 6 fig code.
        const match = generateGUID();
        return match;
    },
    // optional
    authentication: authentication,
    customEndpoints: endpoints(),
    serverOptions: serverOptions,
};


// Initialize the game server core
const core = GameserverCore(config);

// Override SIGINT signal handling, SIGINT is the interupt signal from ctrl+c in terminal
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

async function handleExit()
{
    console.log("Terminating");
    // removes this server from S3 discovery
    await Storage.remove(HOSTNAME);

    // stop also unregisters process.on EXIT, if you use others, add it after.
    core.stop();
    process.exit();
}
