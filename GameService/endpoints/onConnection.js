import { parse } from 'url';

import { matchCodes, matches } from "../store.js";
import { GetRoleFromString } from "../models/MatchAccessRoles.js";
import { getPlayerObject } from '../../shared/utils/getPlayerObject.js';
import { errorBindings, eventBindings } from '../../shared/globals.js';

export async function onConnection(session, req)
{
    console.log("player connection");

    const urlParams = parse(req.url, true).query;

    const { key, role, auth } = urlParams;

    let user = { id: auth };

    try
    {
        // TODO: verify user
    }
    catch(error)
    {
        session.socket.close(4001, error);
        return;
    }

    user = await getPlayerObject(user);

    
    user.send = (message) =>
    {
        session.socket.send(JSON.stringify(message));
    };
    
    session.user = user;

    const matchCode = matchCodes[key];

    const match = matches.findMatchById(matchCode);

    if(!match)
    {
        throw new Error('Invalid Match');
    }


    const userrole = GetRoleFromString(role);

    session.match = match;
    
    const connected = match.Connect(user, userrole);

    if(connected)
        user.send({ event: eventBindings.JOINED_GAME });
    else
        user.send({ error: errorBindings.FAILED_TO_JOIN_GAME });

}
