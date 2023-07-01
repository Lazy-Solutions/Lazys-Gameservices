import { validateFields } from '../Shared/utils/ValidateUtils.js';
import PlayerQueue from '../services/PlayerQueue.js';
import MatchManager from '../services/MatchManager.js';
import ConfigManager from '../services/ConfigManager.js';
import SuccessCode from '../../Shared/common/SuccessCodes.js';
import EventResponse from '../../Shared/common/EventResponse.js';
import CustomError from '../../Shared/common/CustomError.js';


export async function joinMatchQueue(req, res) {   
    try {
        const player = await ConfigManager.get().generatePlayer(req);
        
        if (PlayerQueue.hasPlayerWithId(player.id) || MatchManager.hasPlayerWithId(player.id)) {
            res.send(new EventResponse(SuccessCode.JOINED_QUEUE));
            return;
        }

        PlayerQueue.enqueue(player);

        res.send(new EventResponse(SuccessCode.JOINED_QUEUE));

    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).send(new EventResponse(error.code, error.message));
        } else {
            console.log(`${error.status} ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }
}

