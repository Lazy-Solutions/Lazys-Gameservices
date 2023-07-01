import PlayerQueue from "./PlayerQueue.js";
import Match from '../models/Match.js';
import MatchManager from "./MatchManager.js";
import ConfigManager from "./ConfigManager.js";
import axios from "axios";

let isRunning = false;
let inactiveServers = [];

export const getGameServersInactive = () => [...inactiveServers];

function stop() {
    if (!isRunning) return;
    isRunning = false;
}

export default function Matchmaking() { 
    isRunning = true;
    loop();

    return {
        stop: stop
    };
}

async function loop() {
    while (isRunning) {
        try {
            const requiredMatches = Math.floor(PlayerQueue.getSize() / ConfigManager.get().lobbySize);

            if(requiredMatches > 0){

                const matches = await getMatches(requiredMatches);
                const matchedWithPlayers = await matchPlayers(matches);
                
                addMatchesToManager(matchedWithPlayers);

            }
            console.log(PlayerQueue.getSize() + " in player queue");
        } catch (error) {
            console.log(error);
        }
        await wait(2000);
    }
}


async function getMatches(matchesCount) {
    const gameServers = await ConfigManager.get().servers();

    const matches = [];
    let unresponsiveServers = [];

    for (const server of gameServers) {
        try {
            const response = await axios.get(`http://${server.ip}:${server.api_port}/match/${matchesCount}`);
            const serverMatchIds = response.data;

            for (const matchId of serverMatchIds) {
                const match = new Match(matchId, server);
                matches.push(match);
            }

            if (matches.length >= matchesCount) {
                break; // Stop querying more servers if we have enough matches
            }
        } catch (error) {
            console.log(error.message);
            console.log(error.stack);
            // Handle server error, log or continue to the next server
            unresponsiveServers.push(server);
        }
    }

    inactiveServers = unresponsiveServers;

    if (unresponsiveServers.length === gameServers.length) {
        throw new Error("No game servers responded."); // Throw an error if no server responded
    }

    return matches;
}

async function matchPlayers(matches) {
    for (const match of matches) {
        const playersSelected = await selectPlayers();

        match.players.push(...playersSelected);

        dequeueSelectedPlayers(playersSelected);
    }
    return matches;
}

async function selectPlayers() {
    const config = ConfigManager.get();
    const playerQueue = PlayerQueue.getQueue();
    return await config.matchingLogic(playerQueue);
}

function dequeueSelectedPlayers(playersSelected) {
    PlayerQueue.dequeuePlayers(playersSelected);
}

function addMatchesToManager(matches) {
    MatchManager.addMatches(matches);

}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}