import fs from 'fs';
import path from 'path';

/**
 * This uses the locking for when using docker or multiple instances to write to a local file.
 * This was made for dev.
 * you may want to modify the script if you plan to use it in release
 */
export async function fileManager()
{
    let lockFile;
    const file = './data/data.json';
    const lock = './data/lock.lock';

    const get = async () => await readDataFromFile();

    const set = async data => await writeDataToFile(data);

    async function acquireLock()
    {
        const lockDir = path.dirname(lock);

        try
        {
            // Create the directory if it doesn't exist and acquire lock
            await fs.promises.mkdir(lockDir, { recursive: true, mode: 0o777 });
            lockFile = await fs.promises.open(lock, 'wx');
            return true; // Lock acquired
        } 
        catch(error)
        {
            if(error.code === 'EEXIST' || error.code === 'EACCES')
            {
                // Lock already held by another process or permission issue
                return false;
            } else
            {
                // Handle other errors
                throw error;
            }
        }
    }


    async function releaseLock()
    {
        try
        {
            await lockFile?.close();
            if(await fs.promises.stat(lock).catch(() => null))
            {
                await fs.promises.unlink(lock);
            }
        }
        catch(error)
        {
            throw error;
        }
    }

    // in this mock, it should not be opened often anyways, so if it fails, somethings wrong, force unlock it
    async function waitForLock()
    {
        const maxRetries = 10; // Maximum number of retries
        const retryDelay = 1000; // Delay between retries in milliseconds

        let retries = 0;
        while(retries < maxRetries)
        {
            if(await acquireLock())
            {
                return; // Lock acquired, exit the loop
            }

            retries++;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        console.error('Timeout: Unable to acquire the lock.'); // Lock acquisition timed out
        await releaseLock();
    }

    async function readDataFromFile()
    {
        await waitForLock();

        try
        {
            const data = await fs.promises.readFile(file, 'utf8');
            return JSON.parse(data);
        }
        catch(error)
        {
            return {}; // returns empty as we will save it again, even if it doesnt exist
        }
        finally
        {
            await releaseLock();
        }
    }

    async function writeDataToFile(data)
    {
        await waitForLock();

        try
        {
            await fs.promises.writeFile(file, JSON.stringify(data), 'utf8');
        }
        catch(error)
        {
            console.error(error);
        }
        finally
        {
            await releaseLock();
        }
    }

    return {
        get,
        set
    };
}