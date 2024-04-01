import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { isDev } from '../shared/globals.js';
import { CoreService } from '../core/core.js';
import { google } from './endpoints/auth/google.js';

const { SERVICE, HOSTNAME, IP, PORT } = config;

// Register the service to a storage.
import { Storage } from '../shared/storage.js';

await Storage.init("GAMENAME");

await Storage.addServer(SERVICE, HOSTNAME, { ip: IP, port: PORT });

// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
};

const Default = (req, res, next) => { 
    console.log(`Default route hit on user request: ${req.originalUrl}`);
    res.status(404).send({error: `${req.originalUrl} endpoint not found`}) 
}

const core = new CoreService({
    https: isDev ? undefined : {
        key: './shared/certificates/private.key',
        cert: './shared/certificates/certificate.crt',
    },
    middleware: [cors(), compression(), Errorhandler],
    endpoints: [
        { endpoint: "/auth/google", method: "post", google },
        { endpoint: "*", method: "all", Default },
    ],
    disableWebsocket: true
});


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
export const GatewayService = {
    core,
    handleExit,
    runDiagnostics
};



