import { isDev, config } from './globals.js';
import { BaseStorage } from './utils/storage/baseStorage.js';
import { MOCKStorage } from './utils/storage/MOCK.js';
import { S3Storage } from './utils/storage/S3.js';


export const Storage = {
    init: async function ()
    {
        const { GAME } = config;

        const params = {
            bucket: GAME
        };

        // Initialize Storage
        this._storage = await BaseStorage(isDev ? MOCKStorage : S3Storage, params);
    },

    async getServers(service)
    {
        return await this._storage.getData(`servers/${service}`);
    },

    async getAllServers()
    {
        return await this._storage.getData(`servers`);
    },

    async hasServers(service) {
        return await this._storage.hasKey(`servers/${service}`);
    },

    async addServer(service, server, value)
    {
        const path = `servers/${service}/${server}`;

        await this._storage.add(path, value);
    },

    async removeServer(service, server)
    {
        const path = `servers/${service}/${server}`;

        await this._storage.remove(path);
    },

    async getPlayer(id)
    {
        const path = `players/${id}`;

        const player = await this._storage.getData(path);

        //restore id.
        if(player)
            player.id = id;

        return player;
    },

    async getPlayers(ids)
    {
        const promises = ids.map(id => this.getPlayer(id));

        return await Promise.all(promises);
    },

    async addOrUpdatePlayer(value) {
        // Create a copy of the value object
        const player = { ...value };
    
        // Extract the id property for path, and remove it from the object to be logged
        const id = player.id;
        delete player.id;
    
        const path = `players/${id}`;
    
        // Use the original value object for storage
        await this._storage.add(path, player);
    },    

    async removePlayer(id)
    {
        const path = `players/${id}`;

        this._storage.remove(path);
    }
};