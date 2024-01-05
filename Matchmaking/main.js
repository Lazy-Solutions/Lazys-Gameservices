import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import Authentication from '../services/authentication/authentication.js';
import { CoreService } from '../core/core.js';
import { playerMatcher } from './systems/playerMatcher.js';
import { matchedPlayerQueue, playerQueue } from './store.js';
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
    key: './certificates/private.key',
    cert: './certificates/certificate.crt',
    middleware: [cors(), compression(), Authentication(), Errorhandler],
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

}

function runDiagnostics()
{
    // console.log(`current players in queue: ${ playerQueue.countPlayers() }`);
    // console.log(`current matches in queue: ${ matchedPlayerQueue.length }`);
}

export const Matchmaking = {
    core,
    matchfinder,
    playerMatcher,
    handleExit,
    runDiagnostics
};