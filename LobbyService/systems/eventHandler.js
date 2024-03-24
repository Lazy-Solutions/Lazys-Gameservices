import { eventBindings } from "../../shared/globals.js";

import { acceptChallenge } from "../events/acceptChallenge.js";
import { cancelChallenge } from "../events/cancelChallenge.js";
import { challenge } from "../events/challenge.js";
import { getPlayerData } from "../events/getPlayerData.js";
import { joinQueue } from "../events/joinQueue.js";
import { leaveQueue } from "../events/leaveQueue.js";


export const eventHandlers = {
    [eventBindings.JOIN_QUEUE]: joinQueue,
    [eventBindings.LEAVE_QUEUE]: leaveQueue,
    [eventBindings.GET_PLAYER_DATA]: getPlayerData,
    [eventBindings.CHALLANGE]: challenge,
    [eventBindings.CANCEL_CHALLANGE]: cancelChallenge,
    [eventBindings.ACCEPT_CHALLANGE]: acceptChallenge
};
