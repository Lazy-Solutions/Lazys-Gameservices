import { ErrorLog } from "../database/models/ErrorLog.js";

export async function getAllErrorsEndpoint(req, res)
{
    let existingErrors = await ErrorLog.findAll();

    res.json(existingErrors);
}