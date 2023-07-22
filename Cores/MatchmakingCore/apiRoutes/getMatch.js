import CustomError from "@lazy/shared/common/CustomError.js";
import ErrorCode from "@lazy/shared/common/ErrorCodes.js";

import MatchManager from "../../shared/services/MatchManager.js";

export async function getMatch(req, res) {
    try {
        const player_id = req.params.player_id; // Retrieve the ID from the URL parameters

        if (!player_id) {
            throw new CustomError(ErrorCode.MISSING_FIELDS, 'player_id', 'Missing fields "player_id"');
        }

        const match = MatchManager.getMatchByPlayerId(player_id);

        if (!match) {
            throw new CustomError(ErrorCode.NO_MATCH, '', 'No match ready');
        }

        const { id, server } = match;
        res.json({ id, server: { ip: server.ip, port: server.ws_port } });

    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).json(error.get());
        } else {
            res.status(500).send('Internal Server Error');
        }
    }

}
