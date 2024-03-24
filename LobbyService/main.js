import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { CoreService } from '../core/core.js';
import { playerMatcher } from './systems/playerMatcher.js';
import { matchfinder } from './systems/matchFinder.js';
import { onConnection } from './endpoints/onConnection.js';
import { onMessage } from './endpoints/onMessage.js';
import { onClose } from './endpoints/onClose.js';

const { PORT } = config;

// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
};

const core = new CoreService({
    key: './shared/certificates/private.key',
    cert: './shared/certificates/certificate.crt',
    middleware: [cors(), compression(), Errorhandler],
    endpoints: [],
});

core.onConnection = onConnection;
core.onMessage = onMessage;
core.onClose = onClose;
core.onError = async (error, session) =>
{
    console.error(error);
};

core.start(PORT);
playerMatcher.start();
matchfinder.start();

async function handleExit()
{
    core.stop();
    playerMatcher.stop();
    matchfinder.stop()
}

function runDiagnostics()
{
    // console.log(`current players in queue: ${ playerQueue.countPlayers() }`);
    // console.log(`current matches in queue: ${ matchedPlayerQueue.length }`);
}

// env service is case-sensitive
export const LobbyService = {
    core,
    matchfinder,
    playerMatcher,
    handleExit,
    runDiagnostics
};