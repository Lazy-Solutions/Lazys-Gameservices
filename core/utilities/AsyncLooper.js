/*
Takes an function to call every tick, 

Const AL = new AsyncLooper( async () => {
    do something,
    throw fails,
}, (error) => {
    handle fails.
})
*/


export default class AsyncLooper
{
    constructor(callback, errorCallback)
    {
        this.callback = callback;
        this.errorCallback = errorCallback;
    }

    start()
    {
        if (this.enabled)
            return;

        this.enabled = true;

        this.loop();
    }

    stop()
    {
        this.enabled = false;
    }

    isRunning()
    {
        return this.enabled;
    }

    async loop()
    {
        while (this.enabled)
        {
            try
            {
                await this.callback();
            }
            catch (error)
            {
                await this.errorCallback(error);
            }
        }
    }
}