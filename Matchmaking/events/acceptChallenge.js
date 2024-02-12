import { errorBindings, eventBindings } from "../../shared/globals.js";
import { Match } from "../models/Match.js";
import { connections, matchedPlayerQueue } from "../store.js";
import { challengeHandler } from "../systems/challengeHandler.js";

export async function acceptChallenge(session, data)
{
    const { opponentId } = data;
    const playerId = session.user.id;

    const challenge = challengeHandler.acceptChallenge(opponentId, playerId)

    if (!challenge) {
        return { error: errorBindings.CHALLANGE_FAILED, data: { opponentId } };
    }

    // challenge was accepted, clear the rest
    challengeHandler.cancelMyChallenges(playerId)

    const opponent = connections[opponentId];

    // the match was accepted, add it to matchmaking for server discovery
    // we do not set id here, it will be added by matchfinder
    const match = new Match(undefined, challenge.gameMode, true);

    match.players.push(opponent, session.user);

    matchedPlayerQueue.push(match);

    return { event: eventBindings.CHALLANGE_PENDING, data: { opponentId } };
};

