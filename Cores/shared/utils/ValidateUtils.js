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

export function validateObject(obj, template){
    if (!obj || typeof obj !== 'object') {
      return 'Invalid config object. Please provide a valid object.';
    }
  
    if (!template || typeof template !== 'object') {
      return 'Invalid template object. Please provide a valid object.';
    }
  
    for (const key in template) {
      if (template.hasOwnProperty(key)) {
        if (!obj.hasOwnProperty(key)) {
          return `Missing '${key}' in the config object.`;
        }
 
        const templateValue = template[key];
        const configValue = obj[key];
        const templateType = typeof templateValue;
        const configType = typeof configValue;
  
        if (templateType !== configType) {
          return `Invalid type for '${key}'. Expected '${templateType}', but found '${configType}'.`;
        }
      }
    }
  
    return 'Config object is valid.';
  }