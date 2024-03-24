import compression from 'compression';
import cors from 'cors';

import { config } from '../shared/globals.js';
import { CoreService } from "../core/core.js";
import { extractStackTraceInfo } from '../shared/utils/utils.js';

// DB models
import { sequelize } from './sequalize.js';
import { ErrorLog } from './database/models/ErrorLog.js';

// endpoints
import { logError, logErrorEndpoint } from './endpoints/logError.js';
import { getAllErrorsEndpoint } from './endpoints/getErrors.js';
import { getRegisteredServices } from './endpoints/getRegisteredServices.js';
import { errorEmitter } from './store.js';
import { verifyJwtToken } from '../shared/middleware/verifyJwtToken.js';

const { PORT, SERVICE, JWT_SECRET_KEY } = config;


// Sync the database with the models
async function syncDatabase()
{
    try
    {
        // @ts-ignore, it will be active.
        await sequelize.sync({ force: true }); // Use force: true to drop existing tables and re-create them
        console.log("Database synchronized successfully");
    } catch(error)
    {
        console.error("Error synchronizing database:", error);
    }
}


// Call the syncDatabase function to sync the database
await syncDatabase();

errorEmitter.on((error) =>
{
    const error_message = error.message;
    const stackTrace = extractStackTraceInfo(error.stack);

    //@ts-ignore, wont be undefined
    logError(SERVICE, stackTrace, error_message);
});


// TODO: improve
const Errorhandler = (err, req, res, next) =>
{
    switch(err.message)
    {
        case 'Unauthorized: Invalid Token':
        case 'Unauthorized: Missing Token':
            res.status(401).send(err.message);
            break;
        default:
            errorEmitter.invoke(err);
            // Handle other types of errors
            res.status(500).send('Internal Server Error');
            break;
    }

};

// start core with websocket disabled
const core = new CoreService({
    key: './shared/certificates/private.key',
    cert: './shared/certificates/certificate.crt',
    middleware: [cors(), compression(), verifyJwtToken(JWT_SECRET_KEY), Errorhandler], // TODO: add auth
    endpoints: [
        { endpoint: "/logError", method: "post", callback: logErrorEndpoint },
        { endpoint: "/getAllErrors", method: "get", callback: getAllErrorsEndpoint },
        { endpoint: "/getRegisteredServices", method: "get", callback: getRegisteredServices },
    ],
    disableWebsocket: true,
}); // ws disabled


core.start(PORT);

async function handleExit() { }

async function handleSIGUSR1() { }

async function runDiagnostics(data)
{
    console.log(`used mem: ${ data.used }, heapUsed: ${ data.process.heapUsed }, rss: ${ data.process.rss }: arrayBuffers: ${ data.process.arrayBuffers }`);
}


// env service is case-sensitive
export const MonitorService = {
    core,
    handleExit,
    runDiagnostics,
    handleSIGUSR1
};