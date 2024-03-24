import { fileManager } from './fileManager.js';


export async function MOCKStorage({ bucket })
{
    const { get, set } = await fileManager();

    if(!await checkBucketExist())
    {
        await createBucket();
    }

    async function add(path, value)
    {
        const data = await get();

        const keys = path.split('/');
        let current = data[bucket];

        for(let i = 0; i < keys.length - 1; i++)
        {
            const key = keys[i];

            if(!current[key])
            {
                current[key] = {};
            }

            current = current[key];
        }

        current[keys[keys.length - 1]] = value;

        await set(data);
    }

    async function remove(path)
    {
        const data = await get();

        if(!await hasKey(path))
        {
            // Key not found, nothing to delete
            return;
        }

        const keys = path.split('/');
        const lastKey = keys.pop();

        let current = data[bucket];
        for(const key of keys)
        {
            current = current[key];
        }

        delete current[lastKey];

        await set(data);
    }

    async function hasKey(path)
    {
        const data = await get();

        const keys = path.split('/');
        let current = data[bucket];

        for(const key of keys)
        {
            if(current && typeof current === 'object' && key in current)
            {
                current = current[key];
            }
            else
            {
                return false;
            }
        }

        return true;
    }


    async function getData(path)
    {
        const data = await get();
        const keys = path.split('/');

        let current = data[bucket];

        for(const key of keys)
        {
            // Check if the current key exists in the object
            if(current && current.hasOwnProperty(key))
            {
                current = current[key];
            } 
            else
            {
                // Handle the case where the key is undefined
                current = undefined;
                break;
            }
        }

        return current;
    }

    async function createBucket()
    {
        const _new = {};
        _new[bucket] = {};
        await set(_new);
        return;
    };

    async function checkBucketExist()
    {
        const data = await get();
        return !!data?.[bucket] ?? false;
    };

    return {
        add,
        remove,
        getData,
        hasKey,
    };
}
