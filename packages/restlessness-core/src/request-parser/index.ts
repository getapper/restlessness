import { ValidationObjects, ValidationResult } from './interfaces';

export * from './interfaces';

export const requestParser = async (event, context, validations: ValidationObjects) => {
  let queryStringParameters = event.queryStringParameters || {};
  let payload = JSON.parse(event.body) || {};
  let pathParameters = event.pathParameters || {};
  const validationResult: ValidationResult = {
    isValid: true,
  };

  if (validations.queryStringParameters) {
    try {
      queryStringParameters = await validations.queryStringParameters.validate(queryStringParameters);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.queryStringParametersErrors = e;
      queryStringParameters = validationResult.queryStringParametersErrors.value;
    }
  }
  if (validations.payload) {
    try {
      payload = await validations.payload.validate(payload);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.payloadErrors = e;
      payload = validationResult.payloadErrors.value;
    }
  }
  if (validations.pathParameters) {
    try {
      pathParameters = await validations.pathParameters.validate(pathParameters);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.pathParametersErrors = e;
      pathParameters = validationResult.pathParametersErrors.value;
    }
  }

  return {
    validationResult,
    queryStringParameters,
    payload,
    pathParameters,
  };
};
