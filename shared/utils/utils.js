import crypto from 'crypto';

export function asyncWait(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function findPortFromArgs() {
    for (const arg of process.argv) {
        if (arg.includes('PORT=')) {
            const portValue = arg.split('=')[1];
            const port = parseInt(portValue, 10);
            if (!isNaN(port)) {
                return port;
            }
        }
    }
    return undefined;
}

export function genMatchKey(matchId, apiSecret) {
    if (!matchId || !apiSecret) {
        throw new Error('Both matchId and apiSecret are required.');
    }

    // Concatenate matchId and apiSecret to create the API key
    const apiKey = matchId + '-' + apiSecret;

    // Create a SHA-256 hash of the API key
    const hash = crypto.createHash('sha256');
    hash.update(apiKey);

    // Return the hexadecimal representation of the hash
    return hash.digest('hex');
}

export function areInSameNetwork(_ip, _ip2) {
    const ip1Octets = _ip2.split('.').slice(0, 2).join('.');
    const ip2Octets = _ip.split('.').slice(0, 2).join('.');
    return ip1Octets === ip2Octets;
}

/**
 * Extracts filename, line number, and column number from the second line of the error stack trace.
 * @param {Error} error - The error object containing the stack trace.
 * @returns {string | undefined} A string representing the filename, line number, and column number in the format "filename:row:column", or undefined if not found.
 */
export function extractStackTraceInfo(error)
{
    const stackLines = error.stack?.split('\n');

    // Check if there are stack lines available
    // @ts-ignore
    if(stackLines?.length > 1)
    {
        // @ts-ignore
        const stackLine = stackLines[1].trim();
        const pattern = /.*\/([^\/]+:\d+:\d+)/;
        const matchResult = pattern.exec(stackLine);

        // Check if a match is found
        if(matchResult && matchResult.length > 1)
        {
            return matchResult[1]; // Return the matched string
        }
    }
}
