import ArrayCleaner from '../../GameServerCore/services/Shared/ArrayCleaner/index.js';

let clients = [];
let matches = [];

const arrayCleaner = ArrayCleaner(
    () => matches,
    (match) => match.state === 'end',
    (removedMatches, log) => { 
        matches = removedMatches; 
        console.log(`Removed ${log} matches`); 
    },
    10000
);

function addClient(client) {
    clients.push(client);
}
function removeClient(userId) {
    clients = clients.filter(item => item.id !== userId);
}

export const GameEvents = {
    onClientConnect(client) {
      addClient(client);
      console.log('Client connected:', client.id);
    },
  
    onClientDisconnect(userId) {
      removeClient(userId);
      console.log('Client disconnected:', userId);
    },
  
    onMessageReceived(msg, userId) {
      // Handle received message logic
    }
};

export function createMatch(match) {
    match.state = 'matching';
    matches.push(match);
}

