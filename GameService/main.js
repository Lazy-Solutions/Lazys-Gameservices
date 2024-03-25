import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { CoreService } from "../core/core.js";
import { createMatches } from './endpoints/createMatches.js';
import { onConnection } from './endpoints/onConnection.js';
import { onMessage } from './endpoints/onMessage.js';
import { onClose } from './endpoints/onClose.js';
import { errorEmitter } from './store.js';
import { extractStackTraceInfo } from '../shared/utils/utils.js';



const { ADMIN_KEY: ACCESS_KEY, PORT } = config;

errorEmitter.on(error => {
    const error_message = error.message;
    const stackTrace = extractStackTraceInfo(error.stack);

    // send
})

// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    console.error(err);
    res.send(err);
};


const core = new CoreService({
    key: './shared/certificates/private.key',
    cert: './shared/certificates/certificate.crt',
    middleware: [cors(), compression(), Errorhandler], // TODO: add auth
    endpoints: [
        { endpoint: "/creatematches", method: "post", createMatches }
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

// env service is case-sensitive
export const GameService = {
    core,
    handleExit,
    runDiagnostics
};