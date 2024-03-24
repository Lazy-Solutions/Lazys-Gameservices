import { verifyGoogleId } from '../googleApi.js';
import { verifyJwtToken, createToken } from '../jwtHandler.js';
import { getParams } from './getParams.js';


export async function jwt_authentication(req, res) {
    const { scheme, token } = getParams(req);

    let decoded = verifyJwtToken(token);

    if (!decoded) {
        const googleId = token;
        const isValidGoogleId = await verifyGoogleId(googleId);

        if (!isValidGoogleId) {
            throw new Error('Invalid token');
        }

        const newToken = createToken(googleId);
        res.set('Authorization', `Bearer ${newToken}`);
        decoded = googleId;
    }

    req.auth = { googleId: decoded };
    // no error is success
}
