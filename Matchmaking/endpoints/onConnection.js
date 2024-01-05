import { parse } from 'url';
import { authentication_GoogleId } from '../../services/authentication/googleId.js';
import { connections, playerQueue } from '../store.js';
import { getPlayerObject } from './getPlayerObject.js';


export async function onConnection(session, req)
{
    let user;

    // Access the URL of the request
    const urlParams = parse(req.url, true).query;
    console.log(urlParams);

    // Extract the token from the URL parameters
    const authToken = urlParams.auth;

    try
    {
        user = await authentication_GoogleId(authToken);
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
    // we also ref it in global scope
    connections[user.id] = user;

    // timeout to disconnect AFK connections
    session.timeout = setInterval(() =>
    {
        if(playerQueue.isQueued(user.id))
            return;

        session.socket.close(1000, 'Closing gracefully');
        clearInterval(session.timeout);
    }, 10 * 60 * 100); // 10 min

}


