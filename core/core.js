import { CoreService } from "./services/CoreService.js";
import { PlayerQueue } from "./services/PlayerQueue.js";
import { MatchManager } from "./managers/MatchManager.js";
import { Matchmaking, matchingLogic_MMR } from "./services/Matchmaking.js";
import  { Match } from './models/Match.js';
import  { Player } from './models/Player.js';
import { GenerateUniqueCode, getLocalIpAddress } from "./common.js";
import { MsgCodec } from './encoders/msgpack.js';

const matchingDefaults = { matchingLogic_MMR };
const common = { GenerateUniqueCode, getLocalIpAddress };
const models = { Match, Player };
const encoders = { MsgCodec };

export { CoreService, PlayerQueue, MatchManager, Matchmaking, matchingDefaults, common, models, encoders };