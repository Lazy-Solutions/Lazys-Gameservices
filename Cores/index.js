import MatchmakingCore from './MatchmakingCore/core.js';
import GameserverCore from './GameserverCore/core.js';
import Player from './shared/models/Player.js';
import Match from './shared/models/Match.js';
import MatchManager from './shared/services/MatchManager.js';

import { getLocalIpAddress } from './shared/utils/ServerInfo.js';
import { validateFields } from './shared/utils/ValidateUtils.js';

const Common = {
    getLocalIpAddress,
    validateFields
};

export { MatchmakingCore, GameserverCore, Player, Match, MatchManager, Common };
