import compression from 'compression';
import cors from 'cors';

import { config, isDev, keys } from '../shared/globals.js';
import { CoreService } from '../core/core.js';
import { onConnection } from './endpoints/onConnection.js';
import { onMessage } from './endpoints/onMessage.js';
import { onClose } from './endpoints/onClose.js';
import { verifyJwtToken } from '../shared/middleware/verifyJwtToken.js';

const { PORT, SERVICE, HOSTNAME, IP } = config;
const { JWT_SECRET_KEY } = keys;

// Register the service to a storage.
import { Storage } from '../shared/storage.js';

await Storage.init("GAMENAME");

await Storage.addServer(SERVICE, HOSTNAME, { ip: IP, port: PORT });


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

const Default = (req, res, next) => { 
    console.log(`Default route hit on user request: ${req.originalUrl}`);
    res.status(404).send({error: `${req.originalUrl} endpoint not found`}) 
}

// Middleware to log request processing time
function LogTimeOfRequest(req, res, next) {
    const start = Date.now();
    res.on('finish', function() {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
    });
    next();
};

const core = new CoreService({
    // lets use http in dev, so we dont have to worry about ssl
    https: isDev ? undefined : {
        key: './shared/certificates/private.key',
        cert: './shared/certificates/certificate.crt',
    },
    middleware: [
        cors(), 
        compression(), 
        verifyJwtToken(JWT_SECRET_KEY), 
        LogTimeOfRequest,
        Errorhandler
    ],
    endpoints: [
        { endpoint: "/endpoint", method: "get", admin, exampleEndpoint },
        { endpoint: "/endpoint2", method: "post", ...endpointMiddlewares, exampleEndpoint },
        { endpoint: "*", method: "all", Default }, // Default route should be placed last, as routes are used in order.
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

    await Storage.removeServer(SERVICE, HOSTNAME);
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