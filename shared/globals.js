import { common } from '../core/core.js';
import eventBindings from '../shared/enums/eventBindings.json' assert { type: 'json' };
import errorBindings from '../shared/enums/errorBindings.json' assert { type: 'json' };
import gameModes from '../shared/enums/gameModes.json' assert { type: 'json' };

export { eventBindings, errorBindings, gameModes };

const { getLocalIpAddress } = common;

export const isDev = process.env.NODE_ENV === 'development';

//TODO: could be good to use a vault
export const keys = {
    ADMIN_KEY: process.env.ADMIN_KEY, // admin access?
    SECRET_KEY: process.env.SECRET_KEY, // internal, between services
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY, // user login
}

export const database = {
    DATABASE:process.env.DATABASE || '',
    DBUSER: process.env.DBUSER || '',
    DBPASSWORD: process.env.DBPASSWORD || '',
}

export const config = {
    IP: getLocalIpAddress('eth0') || getLocalIpAddress('Ethernet'), // TODO: check aws,
    PORT: process.env.PORT || 8080,
    GAME: process.env.GAME,
    LOBBY_SIZE: 2,
    AWS_REGION: process.env.AWS_REGION,
    SERVICE: process.env.SERVICE,
}

//TODO: is this the hostname we wanna use? perhaps take the AWS instance id+port
config.HOSTNAME = `${config.IP}:${config.PORT}`;
