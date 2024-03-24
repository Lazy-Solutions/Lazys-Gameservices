import { EventEmitter } from 'events';
import { PlayerQueue } from '../core/core.js';
import { Storage } from '../shared/storage.js';
import { CachedDataRetriever } from '../shared/utils/cachedDataRetriever.js';

// The player queue
export const playerQueue = new PlayerQueue();

// The matched players queue, to find a match server for
export const matchedPlayerQueue = [];

export const connections = {};

const cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
export const cachedServers = new CachedDataRetriever(cacheTTL, async () =>
{
    const service = 'Gameserver';

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

