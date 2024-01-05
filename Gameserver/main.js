import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import Authentication, { authentication_private_apikey } from '../services/authentication/authentication.js';
import { CoreService } from "../core/core.js";
import { createMatches } from './endpoints/createMatches.js';
import { onConnection } from './endpoints/onConnection.js';
import { onMessage } from './endpoints/onMessage.js';
import { onClose } from './endpoints/onClose.js';



const { ACCESS_KEY, PORT } = config;


// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
    res.send(err);
};


const core = new CoreService({
    key: './certificates/private.key',
    cert: './certificates/certificate.crt',
    middleware: [cors(), compression(), Authentication(authentication_private_apikey(ACCESS_KEY)), Errorhandler],
    endpoints: [
        { endpoint: "/creatematches", method: "post", callback: createMatches }
    ],
});

core.onConnection = onConnection;
core.onMessage = onMessage;
core.onClose = onClose;
core.onError = async (error, session) =>
{
    console.error(error);
};

core.start(PORT);

async function handleExit() { }

function runDiagnostics() { }

export const Gameserver = {
    core,
    handleExit,
    runDiagnostics
};