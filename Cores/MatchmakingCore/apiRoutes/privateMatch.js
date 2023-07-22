import ErrorCode from '@lazy/shared/common/ErrorCodes.js';
import CustomError from "@lazy/shared/common/CustomError.js";

import MatchManager from "../../shared/services/MatchManager.js";
import { createPrivateMatch } from "../services/Matchmaking.js";


export async function privateMatch(req, res)
{
    try
    {
        let match = (!req.params.match_id) ? await getPrivateMatch() : joinPrivateMatch(req.params.match_id);

        if (!match)
            throw new CustomError(ErrorCode.FAILED_TO_JOIN, "Servers temporary down");

        const { id, server } = match;

        res.send({ id, server: { ip: server.ip, port: server.ws_port } });
    }
    catch (error)
    {
        if (error instanceof CustomError)
        {
            res.status(400).json(error.get());
        } else
        {
            console.log(`${error.status} ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }

}

async function getPrivateMatch()
{
    const matches = await createPrivateMatch();
    return matches[0];
}

function joinPrivateMatch(match_id)
{
    const match = MatchManager.getMatchById(match_id);
    return match;
}