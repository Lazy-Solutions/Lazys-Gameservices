import Config from 'Matchmaking_core/models/Config.js';
import Player from 'Matchmaking_core/models/Player.js';
import MatchmakingCore from 'Matchmaking_core/core.js';
import { utils } from 'Matchmaking_core/common.js';

const { validateFields } = utils;

// Override examples

// returns the information of the game servers, tip: cache the results if collected from external source.
function serverList() {
    return [
        { ip: '127.0.0.1', ws_port: 9001, api_port: 9000 }
    ];
}


// Overrides the matching logic, determines the match based on the level proximity of the players
function MatchingLogicByRandom(players) {
    const randomPlayers = players.sort(() => 0.5 - Math.random()).slice(0, config.lobbySize);
    return randomPlayers;
}

// Overrides player generator, extends our player object with mmr.
function GeneratePlayer(req) {
    const { id, mmr } = req.body;
    /*  
    Adds field requirements to users when the server should register a new player.
    in this example we need the users to provide id and mmr
    It throws an error, that will be sent to the user "invalid request data".
    */
    validateFields(req.body, ['id', 'mmr']);

    // Shows that the Auth example passed on auth token, from the auth override.
    console.log(req.auth);

    return { ...new Player(id), mmr: mmr };
};

// success?, return true or false
async function Authentication(req) {
    const token = req.header('Authorization');

    // perform validation, etc
    if(token !== "1234") 
        return false;

    // example use of auth node to pass any data you require to your endpoints.
    req.auth = { token }; // in this example we pass on an object with a token.

    return true; 
}

// Core implementation

const config = new Config({
    // required
    port: process.env.API_PORT || 8080,
    lobbySize: 2,
    servers: serverList,
    // overrides
    matchingLogic: MatchingLogicByRandom,
    generatePlayer: GeneratePlayer,
    authentication: Authentication,
});

// initializes core
const core = new MatchmakingCore(config);

// Override SIGINT signal handling, SIGINT is the interupt signal from ctrl+c in terminal
process.on('SIGINT', () => {
    core.stop();
    process.exit();
});


