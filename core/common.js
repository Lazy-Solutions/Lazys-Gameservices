import os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
* Generates a 6-character unique code.
*
* Example usage:
*
* const usedCodes = [];
* usedCodes.push();
*
* GenerateUniqueCode((code) => usedCodes.includes(code));
* @returns {string} - A unique 6-character code.
*/
function GenerateUniqueCode(saved_guids)
{
    let guid;

    do
    {
        guid = uuidv4().substring(0, 6);
    }
    while (saved_guids.includes(guid));

    return guid;
}


function getLocalIpAddress(interfaceName)
{
    const iface = os.networkInterfaces()[interfaceName];
    const ipAddress = iface?.find((ifaceEntry) => ifaceEntry.family === 'IPv4' && !ifaceEntry.internal)?.address;
    return ipAddress || null;
}

export { GenerateUniqueCode, getLocalIpAddress }