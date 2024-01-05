import { models } from '../../core/core.js';
import { connections } from '../store.js';
import { errorBindings, eventBindings } from '../../shared/globals.js';


const { Match: ExtendedMatch } = models;

export class Match extends ExtendedMatch
{
    constructor(id, _private = false)
    {
        super(id, _private);
        this.key = undefined;
        this.server = undefined;

    }

    sendServerInfo(){
        for (const player of this.players) {
            player.send({ event: eventBindings.MATCHED, data: { key: this.key, server: this.server }});
        }
    }

}