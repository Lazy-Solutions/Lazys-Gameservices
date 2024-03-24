import os from 'os';

let service;

/**
 * @param {number} bytes
 */
function bytesToGB(bytes) {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2);
}

function processMem() {
    const memoryUsage = process.memoryUsage();
    
    return {
      rss: bytesToGB(memoryUsage.rss),
      heapTotal: bytesToGB(memoryUsage.heapTotal),
      heapUsed: bytesToGB(memoryUsage.heapUsed),
      external: bytesToGB(memoryUsage.external),
      arrayBuffers: bytesToGB(memoryUsage.arrayBuffers),
    };
  }


/**
 * @param {(arg0: { total: string; free: string; used: string; }) => void} callback
 */
export function runOSDiagnostics(callback, frequency){
    service = setInterval(() => {
        const totalMemory = os.totalmem(); // might change? unsure with docker containers
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;

        const data = {
            total: bytesToGB(totalMemory),
            free: bytesToGB(freeMemory),
            used: bytesToGB(usedMemory),
            process: processMem()
        } 

        callback(data);
    }, frequency);
}

export function stopOSDiagnostics(){
    clearInterval(service);
}