import { Player } from '../../shared/models/Player.js';
import { Storage } from '../../shared/storage.js';

export async function getPlayerObject(user)
{
    let player = await Storage.getPlayer(user.id);

    let needsStorageUpdate = false;
    
    if(!player)
    {
        // TODO: set the base mmr for new account elsewhere?
        player = new Player(user.id);
        player.mmr = 1000;
        
        needsStorageUpdate = true;
    }

    const { hasUnwantedProperties, cleanedData } = Player.cleanAndCheckForUnwantedProperties(player);

    
    if(hasUnwantedProperties)
    {
        // Update the player with cleaned data
        Object.assign(player, cleanedData);
        
        // Flag that an update is needed
        needsStorageUpdate = true;
    }
    
    // Perform the storage update only if needed
    if(needsStorageUpdate)
    {
        await Storage.addOrUpdatePlayer(player);
    }

    return player;
}
