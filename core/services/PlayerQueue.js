const { log, error, warn } = console;

export class PlayerQueue
{
    constructor ()
    {
        this.queue = {};
        this.customQueueKeyGenerator = null;
    }

    enqueue(player)
    {
        const queueKey = this.generateQueueKey(player); // string
        this._enqueue(queueKey, player);
    }

    enqueueWithKey(key, player)
    {
        this._enqueue(key, player);
    }

    enqueuePlayers(players)
    {
        for(const player of players)
        {
            this.enqueue(player);
        }
    }

    enqueuePlayersWithKey(key, players)
    {
        for(const player of players)
        {
            this.enqueueWithKey(key, player);
        }
    }

    _enqueue(queueKey, player)
    {

        if(!this.queue[queueKey])
        {
            this.queue[queueKey] = [];
        }

        this.queue[queueKey].push(player);
    }

    dequeue(playerId)
    {
        for(const queueKey in this.queue)
        {
            const index = this.queue[queueKey].findIndex(p => p.id === playerId);
            if(index !== -1)
            {
                this.queue[queueKey].splice(index, 1);

                if(this.queue[queueKey].length === 0)
                {
                    delete this.queue[queueKey];
                }

                break; // we break here as the user should not be queued to multiple gamemodes/keys. or should they?
                // TODO: think about this.
            }
        }
    }

    dequeuePlayers(players)
    {
        for(const player of players)
        {
            this.dequeue(player.id);
        }
    }

    dequeueIds(ids)
    {
        for(const id of ids)
        {
            this.dequeue(id);
        }
    }

    clear()
    {
        this.queue = {};
    }

    getQueue()
    {
        return { ...this.queue };
    }

    getQueueByKey(key)
    {
        return this.queue[key] ?? undefined;
    }

    getQueueAt(index)
    {
        if(index < 0 && index >= this.countQueues())
        {
            return undefined;
        }

        const key = this.getKeyAt(index);

        return this.queue[key] ?? undefined;
    }

    getAllPlayers()
    {
        const allPlayers = [];
        for(const queueKey in this.queue)
        {
            allPlayers.push(...this.queue[queueKey]);
        }
        return allPlayers;
    }

    isQueued(player_id)
    {
        const players = this.getAllPlayers();
        return players.some(player => player.id === player_id);
    }

    getKeys()
    {
        return Object.keys(this.queue) ?? [];
    }

    getKeyAt(index)
    {
        const keys = Object.keys(this.queue);

        if(index < 0 || index >= keys.length)
        {
            return undefined;
        }

        return keys[index];
    }

    getKeyIndex(key)
    {
        const keys = Object.keys(this.queue);
        return keys.indexOf(key);
    }

    removeQueueAt(index)
    {
        const keys = Object.keys(this.queue);

        if(index >= 0 && index < keys.length)
        {
            const keyToDelete = keys[index];
            delete this.queue[keyToDelete];
        }
    }

    removeQueue(name)
    {
        delete this.queue[name];
    }

    isEmpty()
    {
        return Object.keys(this.queue).length === 0;
    }

    countPlayers()
    {
        let totalCount = 0;
        for(const queueKey in this.queue)
        {
            totalCount += this.queue[queueKey].length;
        }
        return totalCount;
    }

    countQueues()
    {
        return Object.keys(this.queue).length;
    }

    isMax(max)
    {
        return this.countPlayers() >= max;
    }

    setCustomQueueKeyGenerator(action)
    {
        this.customQueueKeyGenerator = action;
    }

    generateQueueKey(player)
    {
        return (
            (this.customQueueKeyGenerator && this.customQueueKeyGenerator(player)) ||
            this.defaultGenerateQueueKey(player)
        );
    }

    defaultGenerateQueueKey(player)
    {
        return `${ player.ranked ? "Ranked" : "Casual" }_${ player.gameMode }`;
    }
}
