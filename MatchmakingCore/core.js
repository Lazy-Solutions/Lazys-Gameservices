import Api from './api.js';
import { validateFields } from '@lazy/shared/utils/ValidateUtils.js';
import Config from './models/Config.js';
import ConfigManager from './services/ConfigManager.js';
import Matchmaking from './services/Matchmaking.js';

export default function MatchmakingCore(config) {
    
    if(config === undefined)
    {
        config = new Config({});
        console.warn('No config set for Matchmaking.');
    }
    
    ConfigManager.set(config);

    validateFields(config, ['port', 'lobbySize']);


    const API = Api();
    const matchmaking = Matchmaking();

    process.on('SIGINT', stop);

    function stop() {
        if (API) {
            API.close();
            matchmaking.stop();
        }
        process.removeListener('SIGINT', stop);
    }

    return {
        stop
    };
}