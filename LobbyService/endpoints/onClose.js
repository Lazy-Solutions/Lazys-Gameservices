import { connections, playerQueue } from "../store.js";

export async function onClose(session)
{
    console.log("disconnected");
    playerQueue.dequeue(session.user.id);
    clearInterval(session.timeout);
    delete connections[session.user.id];
}