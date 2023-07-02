import { validateFields } from '@lazy/shared/utils/ValidateUtils.js';
import PlayerQueue from '../services/PlayerQueue.js';
import MatchManager from '../services/MatchManager.js';
import EventResponse from '@lazy/shared/common/EventResponse.js';
import SuccessCode from '@lazy/shared/common/SuccessCodes.js';
import CustomError from '@lazy/shared/common/CustomError.js';

export async function leaveMatchQueue(req, res) {
    try {
        validateFields(req.body, ['id']);

        const { id } = req.body;

        PlayerQueue.dequeue(id);
        MatchManager.hasPlayerWithId(id);

        res.send(new EventResponse(SuccessCode.LEFT_QUEUE));
        
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).send(new EventResponse(error.code, error.message));
        } else {
            console.log(`${error.status} ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }
}
