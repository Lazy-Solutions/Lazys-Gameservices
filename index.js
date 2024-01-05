//@ts-nocheck
import dotenv from 'dotenv/config';

import { config } from './shared/globals.js';
import { runOSDiagnostics, stopOSDiagnostics } from "./utils/osDiagnostics.js";
import { Storage } from './shared/storage.js';

await Storage.init();

const { HOSTNAME, PORT, SERVICE, IP } = config;

console.log(config)

await Storage.addServer(SERVICE, HOSTNAME, { ip: IP, port: PORT });

if(!SERVICE)
{
    throw new Error('SERVICE is not defined in the .env file');
}

let core;

try
{
    // @ts-ignore
    core = await import(`./${ SERVICE.charAt(0).toUpperCase() + SERVICE.slice(1) }/main.js`);
    core = core[SERVICE.charAt(0).toUpperCase() + SERVICE.slice(1)];
} 
catch(error)
{
    console.error(error)
    throw new Error(`Error importing module for SERVICE: ./${ SERVICE.charAt(0).toUpperCase() + SERVICE.slice(1) }/main.js`);
}

runOSDiagnostics((data) =>
{
    //TODO: report and create limits
    core.runDiagnostics();
});

// Override SIGINT signal handling, SIGINT is the interupt signal from ctrl+c in terminal
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('SIGUSR1', handleSIGUSR1);

function handleSIGUSR1()
{
    // might be a good use to signal an eventual shutdown. like, when all games are over, terminate,
    // or to read a file containing instructions
}

async function handleExit()
{
    console.log("Terminating");

    stopOSDiagnostics();
    process.removeListener('SIGUSR1', handleSIGUSR1);

    await core.handleExit();

    // remove us from S3
    await Storage.removeServer(SERVICE, HOSTNAME);

    process.exit();
}
