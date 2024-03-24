import jwt from 'jsonwebtoken';

export function verifyJwtToken(JWT_SECRET_KEY)
{
    return function (req, res, next)
    {
        const token = req.headers.authorization;
        if(!token)
        {
            throw new Error('Unauthorized: Missing Token');
        }

        try
        {
            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            req.user = decoded;
            next();
        }
        catch(error)
        {
            throw new Error('Unauthorized: Invalid Token');
        }
    };
}
