import { common } from '../core/core.js';
import eventBindings from '../data/eventBindings.json' assert { type: 'json' };
import errorBindings from '../data/errorBindings.json' assert { type: 'json' };
import gameModes from '../data/gameModes.json' assert { type: 'json' };


const { getLocalIpAddress } = common;

export const isDev = process.env.NODE_ENV === 'development';

export const config = {
    IP: getLocalIpAddress('eth0') || getLocalIpAddress('Ethernet'), // TODO: check aws,
    PORT: process.env.PORT,
    GAME: process.env.GAME,
    LOBBY_SIZE: 2,
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
    AWS_REGION: process.env.AWS_REGION,
    SERVICE: process.env.SERVICE,
}

//TODO: is this the hostname we wanna use? perhaps take the AWS instance id+port
config.HOSTNAME = `${config.IP}:${config.PORT}`;

export { eventBindings, errorBindings, gameModes };