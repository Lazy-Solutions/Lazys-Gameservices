import { eventHandlers } from "../systems/eventHandler";
import { errorBindings } from '../../shared/globals.js'

export async function onMessage(message, session)
{
    //const match = session.match;

    try
    {
        const { event, data } = JSON.parse(message);

        if (!event)
        {
            throw new Error('Incorrect format');
        }

        const eventHandler = eventHandlers[event];


        if (!eventHandler)
        {
            console.warn('Unhandled event:', event);
            throw new Error('Request failed');
        }

        session.ActionTaken = true;
        
        const eventHandledResult = await eventHandler(session, data);
        
        session.socket.send(JSON.stringify(eventHandledResult));
    }
    catch (error)
    {
        session.socket.send(JSON.stringify({ error: errorBindings.ERROR, message: error.message }));
    }
}