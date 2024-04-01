import pkg from 'jsonwebtoken';
const { JsonWebTokenError } = pkg;

export function extractBearerToken(req)
{
    const authorizationHeader = req.headers.authorization;

    if(!authorizationHeader)
    {
        return;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if(scheme !== 'Bearer' || !token)
    {
        return;
    }

    return token;
}
