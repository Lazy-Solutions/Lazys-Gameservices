import CustomError from "../Shared/common/CustomError.js";
import ErrorCode from "../Shared/common/ErrorCodes.js";

export default function Authentication(func) {
    return async (req, res, next) => {
        try {
            const authed = await func(req);

            if (!authed) {
                throw new CustomError(ErrorCode.AUTH_FAILED, 'Access denied.');
            }

            next();
        } catch (error) {
            if (error instanceof CustomError && error.code === ErrorCode.AUTH_FAILED) {
                next(error); // Pass the authentication error to the error handling middleware
            } else {
                next(new Error('Internal server error.')); // Wrap other errors in a CustomError
            }
        }
    };
}