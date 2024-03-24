import { getParams } from './getParams.js';


export function authentication_private_apikey(ACCESS_KEY) {
    return async (req, res) => {
        const { token } = getParams(req);
        
        if (token !== ACCESS_KEY)
            throw new Error('Unauthorized: Invalid Token');
    }
}
