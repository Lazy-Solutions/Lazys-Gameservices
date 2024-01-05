export async function Storage(storageType, params)
{
    const _storageType = await storageType(params);

    const add = async (path, value) => await _storageType.add(path, value);
    const remove = async (path) => await _storageType.remove(path);
    const getData = async (path) => await _storageType.getData(path);
    const hasKey = async (path) => await _storageType.hasKey(path);

    return {
        add,
        remove,
        getData,
        hasKey,
    }
}