/**
 * Represents a match object.
 * @class
 */
export default class Match {
    /**
     * Creates a new instance of the Match class.
     * @constructor
     * @param {string} id - The unique identifier for the match.
     * @param {string} server - The server hosting the match.
     * @param {boolean} [_private=false] - Indicates whether the match is private.
     */
    constructor(id, server, _private = false) {
        /**
         * The date and time when the match was created.
         * @type {Date}
         */
        this.createdAt = new Date();

        /**
         * The unique identifier for the match.
         * @type {string}
         */
        this.id = id;

        /**
         * The array of players participating in the match.
         * @type {Array}
         */
        this.players = [];

        /**
         * The server hosting the match.
         * @type {string}
         */
        this.server = server;

        /**
         * Indicates whether the match is private.
         * @type {boolean}
         */
        this.private = _private;
    }
}
