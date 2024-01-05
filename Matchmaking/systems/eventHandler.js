import { eventBindings } from "../../shared/globals.js";
import { playerQueue } from "../store.js";


export const eventHandlers = {
    [eventBindings.JOIN_QUEUE]: async (session, data) =>
    {
        const { gameMode, ranked } = data;
        const user = session.user;

        if(playerQueue.isQueued(user.id))
        {
            throw new Error('already queued');
        }

        playerQueue.enqueueWithKey(user, `${ ranked ? 'Ranked' : 'Casual' }_${ gameMode }`);

        return { event: eventBindings.JOIN_QUEUE, data: 'Joined Queue' };
    },
    [eventBindings.LEAVE_QUEUE]: async (session, data) =>
    {
        if(!playerQueue.isQueued(session.user.id))
            throw new Error('Not queued');

        playerQueue.dequeue(session.user.id);
        return { event: eventBindings.LEAVE_QUEUE, data: 'Left Queue' };
    },
    // Add more event handlers as needed
    [eventBindings.GET_PLAYER_DATA]: async (session, data) => {
        console.log("Player info requested")
        return { event: eventBindings.GET_PLAYER_DATA, data: session.user } //TODO: might want to prune stuff?
    },
};