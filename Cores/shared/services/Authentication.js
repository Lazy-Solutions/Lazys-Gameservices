import CustomError from "../common/CustomError.js";
import ErrorCode from "../common/ErrorCodes.js";

export function Authentication(func)
{
    return async (req, res, next) =>
    {
        try
        {
            const authed = await func(req, res);

            if (!authed.success)
            {
                throw new CustomError(ErrorCode.AUTH_FAILED, authed.error);
            }

            next();
        }
        catch (error)
        {
            next(error);
        }
    };
}