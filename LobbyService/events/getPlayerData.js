import { eventBindings } from "../../shared/globals.js";

export async function getPlayerData(session, data)
{
    return { event: eventBindings.GET_PLAYER_DATA, data: session.user };
};

