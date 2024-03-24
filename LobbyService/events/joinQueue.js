import { eventBindings } from "../../shared/globals.js";
import { playerQueue } from "../store.js";

export async function joinQueue(session, data)
{
    const { gameMode, ranked } = data;
    const user = session.user;

    if(playerQueue.isQueued(user.id))
    {
        throw new Error('already queued');
    }

    const key = { ranked, gameMode };
    playerQueue.enqueueWithKey(JSON.stringify(key), user);

    return { event: eventBindings.JOIN_QUEUE };
};

