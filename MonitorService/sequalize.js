import { Sequelize } from "sequelize";
import { config } from "../shared/globals.js";

const { DATABASE, DBUSER, DBPASSWORD } = config;

let _sequelize = null;
let isSequelizeReady = false;

async function initSequelize()
{
    _sequelize = new Sequelize(DATABASE, DBUSER, DBPASSWORD, {
        host: 'localhost', //TODO: fix this for docker or standalone
        port: 3306,
        dialect: 'mysql',
        logging: false
    });

    try
    {
        await _sequelize.authenticate();
        console.log('Database connection established successfully.');
        isSequelizeReady = true;
    } catch(error)
    {
        console.error('Error connecting to the database.');
        // Retry connection after a delay
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Retry after 5 seconds
        await initSequelize(); // Retry initialization
    }
}

await initSequelize();

export const sequelize = _sequelize; 
