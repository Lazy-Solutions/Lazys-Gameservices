import jwt from "jsonwebtoken";
import { keys } from "../../../shared/globals.js";
import { extractBearerToken } from "../../../shared/utils/extractBearerToken.js";

const { JWT_SECRET_KEY } = keys;

if(!JWT_SECRET_KEY)
{
    throw new Error("JWT SECRET KEY missing");
}

export function google(req, res)
{
    try
    {
        const access_token = extractBearerToken(req);

        if(!access_token)
        {
            return res.status(401).json({ error: 'Invalid Bearer token' });
        }

        //TODO: implement auth

        const options = {
            expiresIn: '1h', // Token expires in 1 hour
            issuer: 'your_issuer',
            subject: 'from other source'
          };

        // Generate a JWT token with the userId and JWT_SECRET_KEY
        // @ts-ignore, it will be set and checked early
        const jwt_token = jwt.sign({ role: "user" }, JWT_SECRET_KEY, options);

        // Return the token in a JSON response
        return res.json({ jwt_token });
    }
    catch(error)
    {
        console.error(error);
        // If there's an error during token generation, return a 500 Internal Server Error response
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
