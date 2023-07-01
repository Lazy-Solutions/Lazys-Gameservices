/**
 * Represents a match object.
 */


export default class Match {
    constructor(id, server) {
        this.createdAt = new Date();
        this.id = id;
        this.players = [];
        this.server = server;
    }
}

