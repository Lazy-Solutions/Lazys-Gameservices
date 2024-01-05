import axios from "axios";
import https from "https";

import { Storage } from "../../shared/storage.js";
import { config, isDev, errorBindings, eventBindings } from '../../shared/globals.js';
import { matchedPlayerQueue } from '../store.js';
import { areInSameNetwork, genMatchKey } from "../../utils/utils.js";
import { CachedDataRetriever } from "../../services/cachedDataRetriever.js";
import AsyncLooper from '../../core/utilities/AsyncLooper.js';


const { ACCESS_KEY, SECRET_KEY, IP } = config;

const cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
const cachedServers = new CachedDataRetriever(cacheTTL, async () =>
{
    const service = 'gameserver';

    if (!Storage.hasServers(service))
        throw new Error('Missing key.');

    return await Storage.getServers(service);
});

const headers = {
    'Authorization': `Bearer ${ACCESS_KEY}`, // Modify this line to match your API key format
    'Content-Type': 'application/json', // Adjust content type as needed
};

const agent = new https.Agent({
    rejectUnauthorized: false,
});


async function eventCallback()
{
    // Simulate some asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // get all matched player matches.
    const matchCount = matchedPlayerQueue.length;

    // no matches, should we add a delay before we try find again?
    if (!matchCount)
        return;

    // retrieve all currently available servers, these are cached.
    const servers = await cachedServers.getData();

    if (!servers)
        return; // TODO: handle there being no servers

    // we do one request per server, if they give us all or less we repeat the request next loop
    const match = await requestMatches(servers, matchCount);

    // for each match id we get from server we add it to a ready made group.
    // the game server will handle if players dont connect, so we should expect the matches and ids to max.

    const matchIds = match.matchIds;
    const server = match.server;

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

async function requestMatches(servers, matchCount)
{
    const serverKeys = Object.keys(servers);

    for (const server of serverKeys)
    {
        const { ip, port } = servers[server];

        const address = isDev || areInSameNetwork(IP, ip) ? `127.0.0.1:${port}` : `${ip}:${port}`;

        const response = await axios.post(`https://${address}/creatematches`, { matchCount }, {
            httpsAgent: agent,
            headers: headers,
        });

        if (response.status !== 201)
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












