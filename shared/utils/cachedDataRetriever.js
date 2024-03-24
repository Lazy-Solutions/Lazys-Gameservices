export class CachedDataRetriever
{
    constructor(cacheTTL, callback, errorCallback)
    {
        this.cacheTTL = cacheTTL;
        this.callback = callback;
        this.error = errorCallback;
        this.lastCachedTimestamp = 0;
        this.cachedData = null;
    }

    isCacheValid()
    {
        const currentTime = Date.now();
        return this.cachedData !== null && currentTime - this.lastCachedTimestamp < this.cacheTTL;
    }


    async getData()
    {
        if (this.isCacheValid())
        {
            return this.cachedData; // Return cached value if it exists and is not expired
        }

        try
        {
            this.cachedData = await this.callback();
            this.lastCachedTimestamp = Date.now();
        }
        catch (error)
        {
            this.error(error);
        }

        return this.cachedData;
    }
}
