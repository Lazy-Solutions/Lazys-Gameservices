export class CachedDataRetriever
{
    constructor(cacheTTL, callback)
    {
        this.cacheTTL = cacheTTL;
        this.callback = callback;
        this.lastCachedTimestamp = 0;
        this.cachedData = null;
    }

    isCacheValid()
    {
        const currentTime = Date.now();
        return this.cachedData !== null && currentTime - this.lastCachedTimestamp < this.cacheTTL;
    }

    async fetchData()
    {
       return await this.callback();
    }

    async getData()
    {
        if (this.isCacheValid())
        {
            return this.cachedData; // Return cached value if it exists and is not expired
        }

        try
        {
            this.cachedData = await this.fetchData();
            this.lastCachedTimestamp = Date.now();
        }
        catch (error)
        {
            console.error(error);
        }

        return this.cachedData;
    }
}
