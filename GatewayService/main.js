import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { CoreService } from '../core/core.js';
import { login } from './endpoints/login.js';

const { PORT,  } = config;

// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
};

const core = new CoreService({
    key: './shared/certificates/private.key',
    cert: './shared/certificates/certificate.crt',
    middleware: [cors(), compression(), Errorhandler],
    endpoints: [
        { endpoint: "/login", method: "post", callback: login },
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



