import os from 'os';

export function getLocalIpAddress(interfaceName)
{
    const iface = os.networkInterfaces()[interfaceName];
    const ipAddress = iface?.find((ifaceEntry) => ifaceEntry.family === 'IPv4' && !ifaceEntry.internal)?.address;
    return ipAddress || null;
}