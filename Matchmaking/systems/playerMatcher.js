import { config, isDev } from '../../shared/globals.js';
import { Matchmaking, matchingDefaults } from '../../core/core.js';
import { playerQueue, matchedPlayerQueue, connections } from '../store.js';
import { Match } from '../models/Match.js';
import { json } from 'express';

const { LOBBY_SIZE } = config;



async function playersToMatchAction(state)
{
    // this gets the games of the queue, the string we created in store. like "ranked_gamemode", so if we have 2 queues, we get "2"
    const keyCount = Object.keys(playerQueue.queue).length;

    // we return undefined if theres no games in the queue, 
    // will also prevent bugs with lastkey that becomes NaN with mod 0.
    if(keyCount === 0) return undefined;

    state.lastKey = (state.lastKey + 1) % keyCount;
    const queue = playerQueue.getQueueAt(state.lastKey);
    return queue;
}

async function matchingLogicFunction(players, state)
{
    if(players.length < LOBBY_SIZE)
        return [];

    if(players[0].ranked)
        return matchingDefaults.matchingLogic_MMR(200, LOBBY_SIZE)(players);

    // its not mmr based, lets just match them in order. might want to make them random?
    return players.slice(0, LOBBY_SIZE);
}

async function matchedResultsCallback(matches, state)
{
    // there were no matches.
    if(!matches.length)
        return;

    // get match details.
    const key = playerQueue.getKeys()[state.lastKey];
    const keydata = JSON.parse(key);

    // each match should contain an array of players?
    matches.forEach((players) =>
    {
        // we do not set id here, it will be added by matchfinder
        const match = new Match(undefined, keydata.gameMode, false);

        match.players.push(...players);

        matchedPlayerQueue.push(match);

        players.forEach((player) =>
        {
            playerQueue.dequeue(player.id);
        });
    });
}

async function onError(error)
{
    console.log(error);
}

const initState = {
    lastKey: 0,
};

// @ts-ignore
const matchmaking = new Matchmaking({
    playersToMatchAction,
    matchingLogicFunction,
    matchedResultsCallback,
    onError,
    interval: 2000,
    maxMatchesPerInterval: 10,
    initState,
});

export const playerMatcher = {
    start: () => matchmaking.start(),
    stop: () => matchmaking.stop(),
    isRunning: () => matchmaking.isRunning()
};