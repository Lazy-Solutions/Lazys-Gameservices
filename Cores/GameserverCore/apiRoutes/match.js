// Shared
import ConfigManager from "@lazy/shared/services/ConfigManager.js";

const { OnCreateGameAction } = ConfigManager.get();

export async function match(){
    const { amount, _private } = req.query;

    const createGameResult = [];


    for (let i = 0; i < amount; i++)
    {
        try
        {
            const result = await OnCreateGameAction(_private);
            createGameResult.push(result);
        } catch (error)
        {
            console.log(`Error creating game: ${error.message}`);
        }
    }
    // Passing the amount to the function
    res.json(createGameResult);
}