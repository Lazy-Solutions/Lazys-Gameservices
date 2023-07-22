import { S3Client, HeadBucketCommand, CreateBucketCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';

// TODO: fix the error handling in this project

async function fileManagement()
{
    const file = './data/data.json';
    const lock = './data/lock.lock';

    async function get()
    {
        return await readDataFromFile();
    }
    async function set(data)
    {
        return await writeDataToFile(data);
    }

    let lockFile;
    async function acquireLock()
    {
        try
        {
            lockFile = await fs.promises.open(lock, 'wx');
            return true; // Lock acquired
        }
        catch (error)
        {
            return false; // Lock already held by another process
        }
    }
    async function releaseLock()
    {
        try
        {
            await lockFile?.close();
            if (await fs.promises.stat(lock).catch(() => null))
            {
                await fs.promises.unlink(lock);
            }
        }
        catch (error)
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
        while (retries < maxRetries)
        {
            if (await acquireLock())
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
        catch (error)
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
        catch (error)
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

async function StartMOCK(params)
{
    const { get, set } = await fileManagement();
    const { bucketName, bucketKey } = params;

    if (!await checkBucketExist())
    {
        await createBucket();
    }

    async function checkBucketExist()
    {
        const data = await get();
        return !!data?.[bucketName] ?? false;
    }

    async function createBucket()
    {
        const _new = {};
        _new[bucketName] = {};
        await set(_new);
        return;
    }

    async function getData(key)
    {
        const old = await get();
        return old[key];
    }

    async function add(key, value)
    {
        const old = await get();

        if (!old[bucketName])
        {
            old[bucketName] = {};
        }

        if (!old[bucketName][bucketKey])
        {
            old[bucketName][bucketKey] = {};
        }

        old[bucketName][bucketKey][key] = value;

        await set(old);
    }

    async function remove(key)
    {
        const old = await get();

        if (!old || !old[bucketName] || !old[bucketName][bucketKey] || !old[bucketName][bucketKey][key])
            return;

        delete old[bucketName][bucketKey][key];

        await set(old);
    }

    return {
        getData,
        add,
        remove
    };
}

async function StartAWS(params)
{

    const { bucketName, bucketKey, AWS_REGION } = params;

    const client = new S3Client({ region: AWS_REGION });

    if (!await checkBucketExists(bucketName))
    {
        await createBucket(bucketName);
    }

    async function checkBucketExists(bucketName)
    {
        try
        {
            await client.send(new HeadBucketCommand({ Bucket: bucketName }));
            return true; // Bucket exists
        } catch (error)
        {
            if (error.statusCode === 404)
            {
                return false; // Bucket does not exist
            } else
            {
                throw error; // Other error occurred
            }
        }
    }

    async function createBucket(bucketName)
    {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }));
        return; // Bucket created
    }

    async function getData(bucketName, bucketKey)
    {
        const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: bucketKey });
        const response = await client.send(getObjectCommand);
        const data = response.Body.toString("utf-8");
        return JSON.parse(data);
    }

    async function add(key, value)
    {
        const data = await getData(bucketName, bucketKey);
        data[key] = value;

        const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
            Body: JSON.stringify(data),
        });
        await client.send(putObjectCommand);

        return; // Data added
    }

    async function remove(bucketName, key)
    {
        const data = await getData(bucketName, bucketKey);
        delete data[key];

        const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
            Body: JSON.stringify(data),
        });
        await client.send(putObjectCommand);

        return; // Data removed
    }

    return {
        getData,
        add,
        remove
    };
}



/**
 * * Create an instance of the Storage object.
 * @param {object} params - Configuration parameters for the storage.
 * @param {string} params.bucketName - The name of the S3 bucket. Perhaps the game name
 * @param {string} params.key - The key of the object in the S3 bucket. Matchmaking/Gameserver etc may be good.
 * @param {object} access - AWS access configuration. Default value uses .env settings
 * @param {boolean} access.ENABLE_AWS - Indicates whether AWS is enabled.
 * @param {string} access.AWS_ACCESS_KEY - The AWS access key ID.
 * @param {string} access.AWS_SECRET_ACCESS_KEY - The AWS secret access key.
 * @param {string} access.AWS_REGION - The desired AWS region.
 * @returns {object} - The Storage object.
 */
export default async function S3(params)
{
    // Check if the required parameters are provided
    if (
        !params ||
        !params.bucketName ||
        !params.bucketKey ||
        !params.AWS_REGION
    )
    {
        throw new Error(
            'Incomplete configuration. Please provide, AWS_REGION, bucketName, and bucketKey parameters.'
        );
    }

    const { ENABLE_AWS } = params;

    let s3 = ENABLE_AWS ? StartAWS(params) : StartMOCK(params);

    return s3;
}

