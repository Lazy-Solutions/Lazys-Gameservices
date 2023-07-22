/**
 * Represents a player in the Matchmaking system.
 * @typedef {Object} Player
 * @property {string} id - The ID of the player.
 */

/**
 * Create a new player object.
 * @param {string} id - The ID of the player.
 * @returns {Player} - The player object.
 */
export default class Player {
    constructor(id) {
        this.id = id;
    }
}

// default player generator
export const generatePlayer = {
    // validateData makes sure that the player sends correct data, before we accept. we add the data .
    // It throws an error, that will be sent to the user "invalid request data".
    validate: ['id'],
    generate: (bodyData) => {
        const { id } = bodyData;

        return new Player(id);
    }
};
