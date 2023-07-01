import ConfigManager from "../services/ConfigManager.js";

/**
 * Custom matching logic based on MMR (Matchmaking Rating).
 * @param {string[]} players - The list of players to choose from.
 * @returns {string[]} - The selected players based on closest MMR.
 */
export function MatchingLogicByMmr(players) {
    const lobbySize = ConfigManager.get().lobbySize;

    if (lobbySize >= players.length) {
        // Return all players if there are not enough for a full lobby, or if its just enough
        return players;
    }

    // Sort players by MMR in ascending order
    players.sort((a, b) => getPlayerMmr(a) - getPlayerMmr(b));

    // Select the closest MMR players based on lobby size
    const selectedPlayers = players.slice(0, lobbySize);

    return selectedPlayers;
}
