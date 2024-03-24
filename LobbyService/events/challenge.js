import { errorBindings, eventBindings } from "../../shared/globals.js";
import { connections } from "../store.js";
import { challengeHandler } from "../systems/challengeHandler.js";

export async function challenge(session, data) 
{
    const { gameMode, opponentId } = data;

    // check if opponent is connected
    const opponent = connections[opponentId];

    // opponent is not online.
    if(!opponent)
    {
        return { error: errorBindings.CHALLANGE_FAILED, data: { opponentId } }; // TODO: improve
    }

    // create challenge, if false return pending. (false, cooldown active)

    const success = challengeHandler.createChallenge(session.user.id, opponentId, { gameMode },
        (challengeCancelled, cooldownCleared) =>
        {
            if(challengeCancelled)
            {
                opponent.send({ error: errorBindings.CHALLANGE_FAILED, data: { opponentId } });
            }
        });

    if(!success)
    {
        return { event: eventBindings.CHALLANGE_PENDING, data: { opponentId } };
    }

    // challenge was created.

    // send the challange.
    await opponent.send({ event: eventBindings.CHALLANGED, data: { opponentId: session.user.id } });

    return { event: eventBindings.CHALLANGE_PENDING, data: { opponentId } };
};

