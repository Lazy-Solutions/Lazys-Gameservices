import { validateFields } from '@lazy/shared/utils/ValidateUtils.js';
import SuccessCode from '@lazy/shared/common/SuccessCodes.js';
import CustomError from '@lazy/shared/common/CustomError.js';

import PlayerQueue from '../services/PlayerQueue.js';
import MatchManager from '../../shared/services/MatchManager.js';

export async function leaveMatchQueue(req, res) {
    try {
        validateFields(req.body, ['id']);

        const { id } = req.body;

        PlayerQueue.dequeue(id);
        MatchManager.hasPlayerWithId(id);

        res.json({ code: SuccessCode.LEFT_QUEUE });
        
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).json(error.get());
        } else {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    }
}
