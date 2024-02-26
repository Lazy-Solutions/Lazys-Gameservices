/**
 * Base class for Match object, to be extended.
 */

export class Match
{
    constructor(id, _private = false)
    {
        this.id = id;
        this.createdAt = new Date();
        this.private = _private;
        this.players = [];
    }
}