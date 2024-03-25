import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { CoreService } from '../core/core.js';
import { onConnection } from './endpoints/onConnection.js';
import { onMessage } from './endpoints/onMessage.js';
import { onClose } from './endpoints/onClose.js';
import { verifyJwtToken } from '../shared/middleware/verifyJwtToken.js';

const { PORT, JWT_SECRET_KEY } = config;

// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
};

function admin(req, res, next)
{
    next();
};

const endpointMiddlewares = [admin];

function exampleEndpoint(req, res) { }

const core = new CoreService({
    key: './shared/certificates/private.key',
    cert: './shared/certificates/certificate.crt',
    middleware: [cors(), compression(), verifyJwtToken(JWT_SECRET_KEY), Errorhandler],
    endpoints: [
        { endpoint: "/endpoint", method: "get", admin, exampleEndpoint },
        { endpoint: "/endpoint2", method: "post", ...endpointMiddlewares, exampleEndpoint },
    ],
    disableWebsocket: false
});

core.onConnection = onConnection;
core.onMessage = onMessage;
core.onClose = onClose;
core.onError = async (error, session) =>
{
    console.error(error);
};

core.start(PORT);


async function handleExit()
{
    core.stop();
}

function runDiagnostics()
{
    // console.log(`current players in queue: ${ playerQueue.countPlayers() }`);
    // console.log(`current matches in queue: ${ matchedPlayerQueue.length }`);
}

// env service is case-sensitive
export const TEMPLATESERVICE = {
    core,
    handleExit,
    runDiagnostics
};