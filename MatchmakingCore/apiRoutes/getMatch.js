import CustomError from "@lazy/shared/common/CustomError.js";
import ErrorCode from "@lazy/shared/common/ErrorCodes.js";
import MatchManager from "../services/MatchManager.js";

export async function getMatch(req, res) {
    try {
        const player_id = req.params.player_id; // Retrieve the ID from the URL parameters

        if (!player_id) {
            throw new CustomError(ErrorCode.MISSING_FIELDS, 'player_id');
        }

        const { id, server } = MatchManager.getMatch(player_id);
        res.send({ id, server: { ip: server.ip, port: server.ws_port } });

    } catch (error) {
        if (error instanceof CustomError) {
            res.status(400).send(new EventResponse(error.code, error.message));
        } else {
            console.log(`${error.status} ${error.message}`);
            res.status(500).send('Internal Server Error');
        }
    }

}
