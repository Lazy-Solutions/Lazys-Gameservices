import express, { json } from 'express';
import compression from 'compression';
import ConfigManager from './services/ConfigManager.js';
import Authentication from './services/Authentication.js';
import { joinMatchQueue, leaveMatchQueue, createPrivateGame, getMatch } from './apiRoutes/ApiRoutes.js';
import CustomError from './Shared/common/CustomError.js';
import ErrorCode from './Shared/common/ErrorCodes.js';

function Api() {
    const { port, authentication } = ConfigManager.get();

    const app = express();
    app.use(json());
    app.use(compression()); // Add gzip compression middleware
    app.use(Authentication(authentication));

    // Error handling middleware for SyntaxError and other errors
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
            res.status(400).json({ error: 'Bad Request - Invalid JSON' });
        } else if (err instanceof CustomError && err.code === ErrorCode.AUTH_FAILED) {
            res.status(401).json({ error: 'Access denied.' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.post('/join', joinMatchQueue);
    app.post('/leave', leaveMatchQueue);
    app.get('/match/:player_id', getMatch);
    app.get('/private', createPrivateGame);

    const api = app.listen(port, () => {
        console.log(`MatchmakingCore server is running on port ${port}`);
    });

    // Stop the server
    function close() {
        api.close();
    }

    return {
        close,
    };
}

export default Api;
