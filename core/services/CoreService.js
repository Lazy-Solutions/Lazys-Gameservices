import express from 'express';
import https from 'https';
import fs from 'fs';
import { WebSocketServer } from 'ws';

export class CoreService
{
    constructor ({ key, cert, middleware, endpoints }, disableWebsocket = false)
    {
        this.app = express();

        const privateKey = fs.readFileSync(key, 'utf8');
        const certificate = fs.readFileSync(cert, 'utf8');
        const credentials = { key: privateKey, cert: certificate };

        this.server = https.createServer(credentials, this.app);

        if(!disableWebsocket)
            this.wss = new WebSocketServer({
                server: this.server,
                rejectUnauthorized: false //TODO: fix, Accept self-signed certificates in development, 
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
        endpoints?.forEach(({ endpoint, method, callback }) =>
        {
            this.app[method](endpoint, callback);
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