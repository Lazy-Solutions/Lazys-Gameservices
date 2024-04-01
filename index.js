/** 
* index is the starting point for these example setups.
* Since the examples uses alot of the same code, i made it dynamic with the help of dynamic import and env


*/
import dotenv from 'dotenv/config';

import { config } from './shared/globals.js';
import { runOSDiagnostics, stopOSDiagnostics } from "./shared/utils/osDiagnostics.js";

const { SERVICE } = config;

console.log(config)


if(!SERVICE)
{
    throw new Error('SERVICE is not defined in the .env file');
}

let core;

// Loads in the service based on SERVICE in env
// env service is case-sensitive
try
{
    core = await import(`./${ SERVICE }/main.js`);
    core = core[SERVICE];
} 
catch(error)
{
    console.error(error)
}

runOSDiagnostics((data) =>
{
    //TODO: report and create limits
    core?.runDiagnostics(data);
}, 5000);

// Override SIGINT signal handling, SIGINT is the interupt signal from ctrl+c in terminal
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('SIGUSR1', handleSIGUSR1);

async function handleSIGUSR1()
{
    await core?.handleSIGUSR1();
    // might be a good use to signal an eventual shutdown. like, when all games are over, terminate,
    // or to read a file containing instructions
}

async function handleExit()
{
    console.log("Terminating");

    stopOSDiagnostics();
    process.removeListener('SIGUSR1', handleSIGUSR1);

    await core?.handleExit();

    // remove us from S3
    process.exit();
}
