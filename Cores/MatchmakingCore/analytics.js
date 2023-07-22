// Shared
import MatchManager from '@lazy/shared/services/MatchManager.js';

// Project
import PlayerQueue from './services/PlayerQueue.js';

export const analytics = {
    getMatchCount: () => MatchManager.count().matches,
    getQueueCount: () => PlayerQueue.count(),
}