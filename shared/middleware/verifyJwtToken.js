import pkg from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { extractBearerToken } from '../utils/extractBearerToken.js';

const { JsonWebTokenError } = pkg;

export function verifyJwtToken(JWT_SECRET_KEY)
{
    return function (req, res, next)
    {
        try
        {
            const token = extractBearerToken(req);

            if(!token)
            {
                throw new JsonWebTokenError("Invalid Bearer token");
            }

            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            req.user = decoded;
        }
        catch(error)
        {
            switch(error.name)
            {
                case 'JsonWebTokenError':
                    return error.message === 'Unauthorized: Invalid Bearer token'
                        ? res.status(401).json({ error: error.message })
                        : res.status(401).send({ error: 'Unauthorized: Invalid token' });
                case 'TokenExpiredError':
                    return res.status(401).send({ error: 'Unauthorized: Token expired' });
                default:
                    throw error;
            }
        }

        next();
    };
}
