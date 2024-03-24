
export function getParams(req)
{
    const authorizationHeader = req.headers.authorization;

    const [scheme, token] = authorizationHeader ? authorizationHeader.split(' ') : [null, null];

    if (!scheme || scheme !== 'Bearer' || !token)
    {
        throw new Error('Unauthorized: Missing Token');
    }

    return { scheme, token };
}