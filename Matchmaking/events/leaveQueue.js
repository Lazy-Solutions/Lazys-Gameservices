import { eventBindings } from "../../shared/globals.js";
import { playerQueue } from "../store.js";

export async function leaveQueue(session, data)
{
    if(!playerQueue.isQueued(session.user.id))
        throw new Error('Not queued');

    playerQueue.dequeue(session.user.id);
    return { event: eventBindings.LEAVE_QUEUE };
};

