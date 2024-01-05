//@ts-nocheck

import { PlayerQueue } from '../core/core.js';



// The player queue
export const playerQueue = new PlayerQueue();
playerQueue.setCustomQueueKeyGenerator((player) => `${player.ranked ? "Ranked" : "Casual"}_${player.gameMode}`);

// The matched players queue, to find a match server for
export const matchedPlayerQueue = [];

export const connections = {};


