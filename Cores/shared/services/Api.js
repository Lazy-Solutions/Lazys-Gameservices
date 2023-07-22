import express from 'express';
import https from 'https';


export default function Api(port, endpoints, middleware, serverOptions = {})
{
    const app = express();

    app.use(express.json());

    middleware?.forEach((mw) =>
    {
        app.use(mw);
    });

    // Dynamically create endpoints based on the 'endpoints' array
    endpoints?.forEach(({ endpoint, method, callback }) =>
    {
        app[method](endpoint, callback);
    });

    const expressServer = https.createServer(serverOptions, app);

    const server = expressServer.listen(port, () =>
    {
        console.log(`Server listening on port ${port}`);
    });

    // Stop the server
    function close()
    {
        server.close();
    }

    return {
        server,
        close,
    };
}