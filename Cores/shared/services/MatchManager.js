import Match from '../models/Match.js';

const matches = {};
const playerMatchIndex = {};


const MatchManager = {

    /**
     * Represents the Match Manager responsible for managing matches.
     * 
     * 
     * you should create a new match and remove the old, if you want to change id.
        or the getMatchById wont return the proper object.
        we use the id as a key.
     *
     * Adds a match to the array of matches.
     * @param {Match} match - The match object to add.
     */
    addMatch(match)
    {
        matches[match.id] = match;

        if (match.private)
            return;

        // Add players for each match to a dict so we can easly find it later on.
        for (const player of match.players)
        {
            playerMatchIndex[player.id] = match.id;
        }
    },

    addMatches(_matches)
    {
        for (const match of _matches)
        {
            this.addMatch(match);
        }
    },

    /**
     * Removes a match from the array of matches.
     * @param {Match} match - The match to remove.
     */
    removeMatch(match)
    {
        delete matches[match.id];
    },

    removeMatches(_matches)
    {
        for (const match of _matches)
        {
            this.removeMatch(match);
        }
    },

    hasPlayerWithId(player_id)
    {
        return playerMatchIndex.hasOwnProperty(player_id);
    },
    /**
     * Retrieves a match managed by the Match Manager, that has a player with the id.
     * @returns {Match} - The match.
     */
    getMatchByPlayerId(player_id)
    {
        console.log("pid: " + player_id);
        const match = matches[playerMatchIndex[player_id]];
        return match;
    },
    /**
     * Retrieves a match managed by the Match Manager.
     * @returns {Match} - The match.
     */
    getMatchById(match_id)
    {
        console.log(matches);
        const match = matches[match_id];
        return match;
    },

    count()
    {
        return {
            matches: matches.length,
            players: playerMatchIndex.length
        };
    }
};

export default MatchManager;


