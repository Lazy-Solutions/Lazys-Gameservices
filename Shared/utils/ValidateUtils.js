import ErrorCodes from "../common/ErrorCodes.js";
import CustomError from '../common/CustomError.js';

export function validateFields(data, requiredPropertiesOrFields) {
    if (!requiredPropertiesOrFields || !data) {
        throw new Error(`Validation fields incorrectly set up: ${!requiredPropertiesOrFields ? "requiredPropertiesOrFields" : "data"} is missing.`);
    }

    const missingPropertiesOrFields = Object.keys(data).filter(prop => {
        const value = data[prop];
        return requiredPropertiesOrFields.includes(prop) && (!value || value === "");
    });

    if (missingPropertiesOrFields.length > 0) {
        throw new CustomError(ErrorCodes.MISSING_FIELDS, missingPropertiesOrFields);
    }
}
