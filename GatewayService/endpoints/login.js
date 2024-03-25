import jwt from "jsonwebtoken";
import { config } from "../../shared/globals.js";

const { JWT_SECRET_KEY } = config;

if(!JWT_SECRET_KEY)
{
    throw new Error("JWT SECRET KEY missing");
}

export function login(req, res)
{
    const { id } = req.body;

    if(!id)
    {
        return res.status(400).json({ error: "'id' is required" });
    }

    try
    {
        //TODO: implement auth

        // Generate a JWT token with the userId and JWT_SECRET_KEY
        // @ts-ignore, it will be set and checked early
        const token = jwt.sign({ id }, JWT_SECRET_KEY, { expiresIn: '1h' });

        // Return the token in a JSON response
        return res.json({ token });
    }
    catch(error)
    {
        console.error(error);
        // If there's an error during token generation, return a 500 Internal Server Error response
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
