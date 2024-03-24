import { ErrorLog } from '../database/models/ErrorLog.js';

export async function logErrorEndpoint(req, res)
{
    const { service, stackTrace, error_message, instance } = req.body;

    try
    {
        logError(service, stackTrace, error_message, instance);
        res.status(200).send();
    }
    catch(error)
    {
        console.error('Error in logErrorEndpoint:', error);
        res.status(500).send();
    }
}

// Initialize cache object outside the function to maintain its state
const cache = new Map();

/**
 * 
 * @param {string} service 
 * @param {string} stackTrace 
 * @param {string} error_message 
 * @param {string} [instance] 
 */
export function logError(service, stackTrace, error_message, instance)
{
    const key = `${ service }-${ stackTrace }-${ error_message }${ instance ? `-${ instance }` : '' }`;

    // Increment count in cache or set to 1 if new error
    cache.set(key, (cache.get(key) || 0) + 1);
}

async function performUpdate()
{
    try
    {
        // Iterate over cache entries and process each error
        for(const [key, count] of cache.entries())
        {
            const keyParts = key.split('-');
            const [service, stackTrace, error_message, instance = null] = keyParts.length >= 4 ? keyParts : [...keyParts, null];


            // Find existing error in the database
            let existingError = await ErrorLog.findOne({ where: { service, stackTrace, error_message, instance } });


            if(existingError)
            {
                // If error exists, increment severity
                await existingError.increment('severity', { by: count });
            } else
            {
                // If error is new, create it in the database
                await ErrorLog.create({ service, stackTrace, error_message, instance, severity: count });
            }
        }

        // Clear the cache after pushing to the database
        cache.clear();
    } catch(error)
    {
        console.error('Error in bulkInsert:', error);
    }
}

setInterval(performUpdate, 1000);
