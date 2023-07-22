import WebSocket, { WebSocketServer } from 'ws';

export default function WSConnection(api, config)
{
    const { OnUserIdCreation, OnClientConnect, OnClientDisconnect, OnMessageReceived, OnError } = config;

    const wss = new WebSocketServer({ server: api });

    wss.on('connection', async (ws, request) =>
    {

        const userId = OnUserIdCreation(ws, request);

        await OnClientConnect(userId, ws);

        ws.on('message', async (message) =>
        {
            // if (!ws.readyState === WebSocket.OPEN)
            // {
            //     return;
            // }

            try
            {
                await OnMessageReceived(JSON.parse(message), userId);
            }
            catch (e)
            {
                console.log('invalid format: ' + e);
            }
        });

        ws.on('close', async () =>
        {
            await OnClientDisconnect(userId);
        });

        ws.on('error', (err) =>
        {
            console.error(err);
        });
    });

    function close()
    {
        wss.close();
    }

    return {
        close
    };
}













