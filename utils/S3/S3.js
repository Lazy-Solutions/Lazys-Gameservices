import { S3Client, HeadBucketCommand, CreateBucketCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// TODO: fix the error handling in this project



async function StartMOCK(params)
{
    const { get, set } = await fileManager();
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

    async function hasKey(key)
    {
        const old = await get();
        return !!old[bucketName][key];
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
        return old[bucketName][key];
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
        remove,
        hasKey
    };
}

//TODO: FIX
async function StartAWS(params)
{

    const { bucketName, bucketKey, AWS_REGION } = params;

    const client = new S3Client({ region: AWS_REGION });

    if (!await checkBucketExists(bucketName))
    {
        await createBucket(bucketName);
    }

    async function checkBucketExists()
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

    async function createBucket()
    {
        await client.send(new CreateBucketCommand({ Bucket: bucketName }));
        return; // Bucket created
    }

    async function getData()
    {
        const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: bucketKey });
        const response = await client.send(getObjectCommand);
        const data = response.Body.toString("utf-8");
        return JSON.parse(data);
    }

    async function add(key, value)
    {
        const data = await getData();
        data[key] = value;

        const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
            Body: JSON.stringify(data),
        });
        await client.send(putObjectCommand);

        return; // Data added
    }

    async function remove(key)
    {
        const data = await getData();
        delete data[key];

        const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: bucketKey,
            Body: JSON.stringify(data),
        });
        await client.send(putObjectCommand);

        return; // Data removed
    }

    async function hasKey(bucketName, key)
    {

    }

    return {
        getData,
        add,
        remove,
        hasKey
    };
}


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

