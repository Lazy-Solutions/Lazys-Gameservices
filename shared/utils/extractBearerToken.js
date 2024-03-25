import pkg from 'jsonwebtoken';
const { JsonWebTokenError } = pkg;

export function extractBearerToken(req)
{
    const authorizationHeader = req.headers.authorization;

    if(!authorizationHeader)
    {
        throw new JsonWebTokenError('Unauthorized: Authorization header missing');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if(scheme !== 'Bearer' || !token)
    {
        throw new JsonWebTokenError('Unauthorized: Invalid Bearer token');
    }

    return token;
}
