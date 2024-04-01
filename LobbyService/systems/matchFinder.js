import axios from "axios";
import https from "https";

import { config, isDev, keys } from '../../shared/globals.js';
import { matchedPlayerQueue, cachedServers } from '../store.js';
import { areInSameNetwork, genMatchKey } from "../../shared/utils/utils.js";
import AsyncLooper from '../../core/utilities/AsyncLooper.js';


const { IP } = config;
const { ACCESS_KEY, SECRET_KEY } = keys;

const headers = {
    'Authorization': `Bearer ${ ACCESS_KEY }`, // Modify this line to match your API key format
    'Content-Type': 'application/json', // Adjust content type as needed
};

const agent = new https.Agent({
    rejectUnauthorized: false,
});


async function eventCallback()
{
    // Simulate some asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // no matches, should we add a delay before we try find again?
    if(!matchedPlayerQueue.length)
        return;

    // retrieve all currently available servers, these are cached.
    const servers = await cachedServers.getData();

    if(!servers)
        return; // TODO: handle there being no servers

    // @ts-ignore, this is dumb
    const { gameMode, matchCount } = processQueue(matchedPlayerQueue);

    // we do one request per server, if they give us all or less we repeat the request next loop
    const results = await requestMatches(servers, matchCount, gameMode);

    // for each match id we get from server we add it to a ready made group.
    // the game server will handle if players dont connect, so we should expect the matches and ids to max.

    const matchIds = results.matchIds;
    const server = results.server;

    matchIds.forEach(matchId =>
    {
        const match = matchedPlayerQueue.shift();
        const key = genMatchKey(matchId, SECRET_KEY);

        match.id = matchId;
        match.server = server;
        match.key = key;

        match.sendServerInfo();
    });
}

async function requestMatches(servers, matchCount, gameMode)
{
    const serverKeys = Object.keys(servers);

    for(const server of serverKeys)
    {
        const { ip, port } = servers[server];

        const address = isDev || areInSameNetwork(IP, ip) ? `127.0.0.1:${ port }` : `${ ip }:${ port }`;

        const response = await axios.post(`https://${ address }/creatematches`, { matchCount, gameMode }, {
            httpsAgent: agent,
            headers: headers,
        });

        if(response.status !== 201)
        {
            // Continue to the next server
            continue;
        }

        // Get the match keys back and return them with the server
        return { matchIds: response.data, server: { ip, port } };
    }

    // No matches or all servers are unavailable
    throw new Error("No servers available");
}

function processQueue(queue)
{
    if(queue.length === 0)
    {
        console.log("Queue is empty.");
        return;
    }

    const gameMode = queue[0].gameMode;
    const matchesForFirstGameMode = queue.filter(match => match.gameMode === gameMode);

    return { gameMode: gameMode, matchCount: matchesForFirstGameMode.length };
}


// TODO: this should report to event manager
// Define an error callback
async function errorCallback(error)
{
    console.error('Error in the loop:', error);
}

const asyncLooper = new AsyncLooper(eventCallback, errorCallback);

export const matchfinder = {
    start: () => asyncLooper.start(),
    stop: () => asyncLooper.stop(),
    isRunning: () => asyncLooper.isRunning(),
}












