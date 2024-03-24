import { Storage } from "../../shared/storage.js";

export async function getRegisteredServices(req, res)
{
    const servers = await Storage.getAllServers();
    res.json(servers);
}