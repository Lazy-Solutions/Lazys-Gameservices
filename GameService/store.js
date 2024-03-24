import { EventEmitter } from "events";
import { MatchManager } from "../core/core.js";
import { Storage } from "../shared/storage.js";
import { CachedDataRetriever } from "../shared/utils/cachedDataRetriever.js";

export const matches = new MatchManager();

//TODO: improve and clean up after use
export const matchCodes = {};


// doubt we use it, but adding just in case
const cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
export const cachedServers = new CachedDataRetriever(cacheTTL, async () =>
{
    const service = 'Matchmaking';

    if(!Storage.hasServers(service))
        throw new Error('Missing key.');

    return await Storage.getServers(service);
}, (error) =>
{
    console.error(error);
});

export const errorEmitter = {
    _event: new EventEmitter(),
    invoke: function (error)
    { // i prefer "invoke" from c#...
        this._event.emit('errorEmitter', error); // Emit event with args
    },
    on: function (listener)
    {
        this._event.on('errorEmitter', listener); // Register listener for event
    }
};
