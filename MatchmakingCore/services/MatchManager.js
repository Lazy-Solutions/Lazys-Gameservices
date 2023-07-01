import Match from '../models/Match.js';
import ConfigManager from '../services/ConfigManager.js';

const matches = {};
const playerMatchIndex = {};

let cleanupServiceRunning = false;

cleanupServiceRunning = true;
cleanupService();

/**
 * Represents the Match Manager responsible for managing matches.
 */
const MatchManager = {

    /**
     * Adds a match to the array of matches.
     * @param {Match} match - The match object to add.
     */
    addMatch(match) {
        matches[match.id] = match;

        // Add players for each match to a dict so we can easly find it later on.
        for (const player of match.players) {
            playerMatchIndex[player.id] = match.id;
        }
    },

    addMatches(_matches) {
        for (const match of _matches) {
            this.addMatch(match);
        }
    },

    /**
     * Removes a match from the array of matches.
     * @param {Match} match - The match to remove.
     */
    removeMatch(match) {
        delete matches[match.id];
    },

    removeMatches(_matches) {
        for (const match of _matches) {
            this.removeMatch(match);
        }
    },

    hasPlayerWithId(player_id) {
        return playerMatchIndex.hasOwnProperty(player_id);
    },
    /**
     * Retrieves a match managed by the Match Manager, that has a player with the id.
     * @returns {Match} - The match.
     */
    getMatch(player_id) {
        const match = matches[playerMatchIndex[player_id]];
        return match;
    },

    count() {
        return {
            matches: matches.length,
            players: playerMatchIndex.length
        };
    }
};

export default MatchManager;

async function cleanupService() {
    const config = ConfigManager.get();

    while (cleanupServiceRunning) {
        await cleanup();

        // Wait for a specified interval before performing the next cleanup
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    async function cleanup() {
    }
}


