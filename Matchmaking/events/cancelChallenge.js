import { errorBindings } from "../../shared/globals.js";
import { connections } from "../store.js";
import { challengeHandler } from "../systems/challengeHandler.js";

export async function cancelChallenge(session, data) 
{
    const { opponentId } = data;

    const opponent = connections[opponentId];

    const cancelled = challengeHandler.cancelChallenge(session.user.id, opponentId);

    if(cancelled)
    {
        await opponent.send({ error: errorBindings.CHALLANGE_FAILED, data: { opponentId: session.user.id } });
    }

    return { error: errorBindings.CHALLANGE_FAILED, data: { opponentId } };
};

