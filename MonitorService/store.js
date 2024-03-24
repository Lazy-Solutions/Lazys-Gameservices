import { EventEmitter } from "events";
import { Storage } from "../shared/storage.js";
import { CachedDataRetriever } from "../shared/utils/cachedDataRetriever.js";

const cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
export const cachedServers = new CachedDataRetriever(cacheTTL, async () =>
{
    return await Storage.getAllServers();
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
