import jwt from 'jsonwebtoken';
//@ts-ignore, will be loaded in docker
import dotenv from 'dotenv';
dotenv.config();

/**
 * @constant {jwt.secret}
 */
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY)
{
    throw new Error('JWT_SECRET_KEY is not defined in the environment variables.');
}

/**
 * @param {string} googleId, Google id provided by user
 * @returns {string} new JWT token
 */
export function createToken(googleId)
{
    //@ts-ignore
    return jwt.sign({ googleId }, JWT_SECRET_KEY, { expiresIn: '1h' });
}

/**
 * Verify the JWT token.
 * @param {string} token - The token to be verified.
 * @returns {string | null} Should return google id if properly set up.
 */
export function verifyJwtToken(token)
{
    if (typeof token !== 'string'){
        return null;
    }

    try
    {
        //@ts-ignore
        return jwt.verify(token, JWT_SECRET_KEY);
    }
    catch (error)
    {
        return null;
    }
}