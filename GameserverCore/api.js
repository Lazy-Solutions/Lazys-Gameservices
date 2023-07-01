import express from 'express';

export default function Api(settings) {
    const api = express();
    api.use(express.json());

    const { port, OnCreateGameAction } = settings;

    api.get('/match/:amount', async (req, res) => {
        const amount = req.params.amount; // Accessing the amount from route parameters

        const createGameResult = await Promise.all(
            Array.from({ length: amount }, async () => {
                return await OnCreateGameAction();
            })
        );
        // Passing the amount to the function
        res.json(createGameResult);
    });


    api.listen(port, () => {
        console.log(`API server listening on port ${port}`);
    });

    return api;
}
