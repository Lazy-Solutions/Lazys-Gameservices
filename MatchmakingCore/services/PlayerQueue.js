const queue = [];

/**
 * Player queue for managing the player queue.
 */
const PlayerQueue = {
    /**
     * Adds a player to the queue.
     * @param {Player} player - The Player object to add to the queue.
     */
    enqueue(player) {
        queue.push(player);
        console.log(`added player to queue: id: ${player.id}`);
    },

    /**
     * Removes a player from the queue.
     * @param {string} playerId - The Player object to remove from the queue.
     */
    dequeue(playerId) {
        const index = queue.findIndex(p => p.id === playerId);
        if (index !== -1) {
            queue.splice(index, 1);
            console.log(`removed player from queue: id: ${playerId}`);
        }
    },

    /**
     * Removes multiple players from the queue.
     * @param {Array<string>} playerIds - The Player object to remove from the queue.
     */

    dequeuePlayers(players) {
        for (const player of players) {
            this.dequeue(player.id);
        }
    },


    /**
     * Clears the player queue.
     */
    clear() {
        queue.length = 0;
    },

    /**
     * Retrieves the current player queue.
     * @returns {Player[]} - An array containing the players in the queue.
     */
    getQueue() {
        return [...queue];
    },

    /**
     * Checks if the player queue is empty.
     * @returns {boolean} - True if the queue is empty, false otherwise.
     */
    isEmpty() {
        return queue.length === 0;
    },

    /**
     * Retrieves the number of players in the queue.
     * @returns {number} - The number of players in the queue.
     */
    getSize() {
        return queue.length;
    },
    /**
     * Checks if queue has player registered
     * @returns {boolean}
     */
    hasPlayerWithId(id) {
        return queue.some(player => player.id === id);
    }
};

export default PlayerQueue;
