import { authentication_GoogleId } from './googleId.js';
import { authentication_private_apikey } from './authentication_private_apikey.js';
import { jwt_authentication } from './jwt_authentication.js';

export { authentication_GoogleId, authentication_private_apikey, jwt_authentication }


export default function Authentication(func)
{
    return async (req, res, next) =>
    {
        try
        {
            await func(req, res);

            next();
        }
        catch (error)
        {
            next(error);
        }
    };
}


