import SuccessCode from '@lazy/shared/common/SuccessCodes.js';
import CustomError from '@lazy/shared/common/CustomError.js';

import PlayerQueue from '../services/PlayerQueue.js';
import MatchManager from '../../shared/services/MatchManager.js';
import ConfigManager from '../../shared/services/ConfigManager.js';


export async function joinMatchQueue(req, res) {   
    try {
        const player = await ConfigManager.get().generatePlayer(req);
        
        if (!PlayerQueue.hasPlayerWithId(player.id) && !MatchManager.hasPlayerWithId(player.id)) {
            PlayerQueue.enqueue(player);
        }

        res.json({ code: SuccessCode.JOINED_QUEUE });

    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).json(error.get());
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
}


