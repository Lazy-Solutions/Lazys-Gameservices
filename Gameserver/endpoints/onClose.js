export async function onClose(session, code, reason)
{
    
    console.log(`Connection closed with code ${code} and reason: ${reason}`);
    
    session.match.disconnect(session.user, code === 1000);

    session = null; // needed for cleanup?
}