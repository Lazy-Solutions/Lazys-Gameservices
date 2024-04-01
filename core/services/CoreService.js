import express from 'express';
import * as _https from 'https';
import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

/**
 * @typedef {Object} Endpoints
 * @property {string} endpoint
 * @property {string} method
 */
/**
 * @typedef {*} Callbacks
 * @description Additional callbacks.
 */

/**
 * 
 */

export class CoreService
{
    /**
     * 
     * @param {Object} parameters
     * @param {{key: string, cert: string}} [parameters.https] - enables https, add keys. 
     * @param {Array} [parameters.middleware] - array of middlewares, see express middlewares, or my examples for usage.
     * @param {Endpoints & Callbacks} [parameters.endpoints] - array of endpoints, for express.
     * @param {boolean} [parameters.disableWebsocket=false] disable websocket?
     */
    constructor ({ https, middleware, endpoints, disableWebsocket = false })
    {
        this.app = express();

        if(https){
            const privateKey = fs.readFileSync(https.key, 'utf8');
            const certificate = fs.readFileSync(https.cert, 'utf8');
            const credentials = { key: privateKey, cert: certificate };

            this.server = _https.createServer(credentials, this.app);
        }

        else {
            this.server = http.createServer(this.app);
        }

        if(!disableWebsocket)
            this.wss = new WebSocketServer({
                server: this.server,
            });

        // Initialize routes, middleware, and WebSocket events
        this.init({ middleware, endpoints });
    }

    init({ middleware, endpoints })
    {
        // Set up Express routes and middleware, may want to remove this for users to decide?
        this.app.use(express.json());

        middleware?.forEach((mw) =>
        {
            this.app.use(mw);
        });

        // Dynamically create endpoints based on the 'endpoints' array
        endpoints?.forEach((/** @satisfies {Endpoints} */ { endpoint, method, ...callbacks }) =>
        {
            const callbacksArray = Object.values(callbacks);
            const endpointCallback = callbacksArray.pop(); // extracts last callback 

            this.app[method](endpoint, ...callbacksArray, endpointCallback);
        });

        // Define WebSocket events
        this.wss?.on('connection', async (socket, req) =>
        {
            const session = { socket };

            await this.onConnection(session, req);

            socket.on('message', message =>
            {
                this.onMessage(message, session);
            });
            socket.on('close', (code, reason) =>
            {
                this.onClose(session, code, reason);
            });
            socket.on('error', error =>
            {
                this.onError(error, session);
            });
        });
    }

    start(port)
    {
        if(!port)
        {
            throw new Error('Unable to start server, port not set.');
        }

        this.server.listen(port, () =>
        {
            console.log(`Server started on port ${ port }`);
        });
    }

    stop()
    {
        //TODO:
        // Implement stop
        // disconnect all wss
        // close listener
    }

    // Getter and setter methods for event handlers
    set onMessage(handler)
    {
        this.customOnMessage = handler;
    }

    get onMessage()
    {
        return this.customOnMessage || this.defaultOnMessage;
    }

    set onConnection(handler)
    {
        this.customOnConnection = handler;
    }

    get onConnection()
    {
        return this.customOnConnection || this.defaultOnConnection;
    }

    set onClose(handler)
    {
        this.customOnClose = handler;
    }

    get onClose()
    {
        return this.customOnClose || this.defaultOnClose;
    }

    set onError(handler)
    {
        this.customOnError = handler;
    }

    get onError()
    {
        return this.customOnError || this.defaultOnError;
    }

    // Default event handler methods
    defaultOnMessage(message, session)
    {
        throw new Error('core onMessage not implemented');
    }

    defaultOnConnection(session)
    {
        throw new Error('core onConnection not implemented');
    }

    defaultOnClose(session)
    {
        throw new Error('core onClose not implemented');
    }

    defaultOnError(error, session)
    {
        throw new Error('core onError not implemented');
    }
}