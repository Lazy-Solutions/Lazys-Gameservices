import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
// @ts-ignore
import { MatchmakingCore, Player, Common } from './core/bundle.js';
// @ts-ignore
import S3 from './S3/S3.js';
// @ts-ignore
import dotenv from 'dotenv';
dotenv.config();

const { validateFields, getLocalIpAddress } = Common;

const IP = getLocalIpAddress('eth0'); // TODO: check aws
const PORT = process.env.API_PORT || 8080;
const isDev = process.env.NODE_ENV === 'development';
const HOSTNAME = process.env.HOSTNAME;

// Register our service for AWS S3, this way we can have our servers find eachother
// You can use other means to connect the servers
const params = {
    bucketName: process.env.GAME,
    bucketKey: 'Matchmaking',
    ENABLE_AWS: !isDev,
    AWS_REGION: 'eu-west-3' // paris?
};

const Storage = await S3(params);
await Storage.add(HOSTNAME, { ip: IP, port: PORT });

let _gameservers;
const cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
let lastCached = Date.now();

const isValidGameservers = (_gameservers) => !_gameservers || Object.keys(_gameservers).length === 0; 

const Gameservers = async () => {
  if (isValidGameservers(_gameservers) && Date.now() - lastCached < cacheTTL) {
    return _gameservers; // Return cached value if it exists and is not expired
  }

  do {
    _gameservers = await Storage.getData('Gameservers');
  } while (isValidGameservers(_gameservers));

  lastCached = Date.now();

  return _gameservers;
};

// Required: returns the information for the game servers, tip: cache the results if collected from external source.
// This requests a dict of servers that the MM should talk with, e.g requesting a new match

async function serverList()
{
    const servers = await Gameservers();

    return Object.values(servers);
}


// Overrides the matching logic, determines the match based on the level proximity of the players,
// Default behaviour is mmr, which is why this example requires mmr
function MatchingLogicByRandom(players)
{
    const randomPlayers = players.sort(() => 0.5 - Math.random()).slice(0, config.lobbySize);
    return randomPlayers;
}

// Overrides player generator, extends our player object with mmr.
function GeneratePlayer(req)
{
    /*  
    Adds field requirements to users when the server should register a new player.
    in this example we need the users to provide id and mmr
    It throws an error, that will be sent to the user "invalid request data".
    */
    validateFields(req.body, ['id', 'mmr']); // we add mmr here to satisfy MatchingLogic

    const { id, mmr } = req.body;
    // Shows that the Auth example passed on auth token, from the auth override.
    console.log(req.auth);

    return { ...new Player(id), mmr: mmr };
};

const SECRET_KEY = '1234';

async function Authentication(req, res /* dont use send. it's handled */)
{
    const authorizationHeader = req.headers.authorization;
    const [scheme, token] = authorizationHeader ? authorizationHeader.split(' ') : [null, null];

    if (scheme !== 'Bearer' || !token)
    {
        return { success: false, error: 'Invalid Token' };
    }

    let decoded = verifyJwtToken(token);

    if (!decoded)
    {
        const googleId = token;
        const isValidGoogleId = await verifyGoogleId(googleId);

        if (!isValidGoogleId)
        {
            return { success: false, error: 'Invalid Token' };
        }

        const newToken = createToken(googleId);
        res.set('Authorization', `Bearer ${newToken}`);
        decoded = { googleId };
    }

    req.auth = { decoded };
    return { success: true, data: decoded };
}

function createToken(googleId)
{
    return jwt.sign({ googleId }, SECRET_KEY, { expiresIn: '1h' });
}

function verifyJwtToken(token)
{
    try
    {
        return jwt.verify(token, SECRET_KEY);
    }
    catch (error)
    {
        return null;
    }
}

async function verifyGoogleId(googleId)
{
    return googleId.search("google") >= 0; // replace with auth
}

function endpoints()
{
    return [
        {
            endpoint: '/update',
            method: 'get',
            callback: (req, res) => 
            {
                console.log(``);
            }
        },
    ];
}

// Read SSL/TLS certificate and key files, change this to change the location of the certs.
// if you really want to run without certs, leave blank or delete
const serverOptions = {
    key: readFileSync('data/private.key'),
    cert: readFileSync('data/certificate.crt')
};

/*  Core implementation

    All optional fields have a default behaviour. which can be viewd in the cores config class.
*/

const config = {
    // required
    port: PORT,
    lobbySize: 2,
    servers: serverList,
    // overrides
    matchingLogic: MatchingLogicByRandom,
    generatePlayer: GeneratePlayer,
    authentication: Authentication,
    customEndpoints: endpoints(), // you can send an event to /event
    serverOptions: serverOptions,
};

// initializes core
const core = new MatchmakingCore(config);

// Override SIGINT signal handling, SIGINT is the interupt signal from ctrl+c in terminal
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

async function handleExit()
{
    console.log("Terminating");
    // remove us from S3
    await Storage.remove(HOSTNAME);
    
    core.stop();
    process.exit();
}

