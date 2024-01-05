import { verifyGoogleId } from "../googleApi.js";
import { getParams } from "./getParams.js";


export async function authentication_GoogleId(token)
{
    const isValidGoogleId = await verifyGoogleId(token);

    if (!isValidGoogleId)
    {
        throw new Error('Unauthorized: Invalid Google ID');
    }

    return { id: token };
    // no error is success
}