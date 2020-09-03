import {  } from './interfaces';
import {
  AuthorizerContext,
  EnvironmentHandler,
  JsonEndpoints,
  DaoPackage,
  JsonDaos,
  JsonDaosEntry,
  JsonAuthorizers,
  AuthorizerPackage,
  JsonAuthorizersEntry,
  ValidationObjects,
  ValidationResult,
  RequestI,
} from '@restlessness/core';
import AWSLambda from 'aws-lambda';

export default async <T  extends AuthorizerContext, Q, P, PP>(
  handler: (req: RequestI<Q, P, PP>) => any,
  validationsBuilder: () => ValidationObjects,
  apiName: string,
  event: AWSLambda.APIGatewayProxyEventBase<T>,
  context: AWSLambda.Context,
) => {
  let queryStringParameters: any = event.queryStringParameters || {};
  let multiValueQueryStringParameters: any = event.multiValueQueryStringParameters || {};
  Object.keys(multiValueQueryStringParameters).forEach(key => {
    if (queryStringParameters[key]) {
      delete queryStringParameters[key];
      const value = multiValueQueryStringParameters[key];
      if (key.match(/.*\[\]$/m)) {
        key = key.slice(0, -2);
      }
      queryStringParameters[key] = value;
    }
  });
  let payload = JSON.parse(event.body || '{}');
  let pathParameters: any = event.pathParameters || {};
  const validations = validationsBuilder();
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
      validationResult.message = e.message;
    }
  }
  if (validations.payload) {
    try {
      payload = await validations.payload.validate(payload);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.payloadErrors = e;
      payload = validationResult.payloadErrors.value;
      validationResult.message = e.message;
    }
  }
  if (validations.pathParameters) {
    try {
      pathParameters = await validations.pathParameters.validate(pathParameters);
    } catch (e) {
      validationResult.isValid = false;
      validationResult.pathParametersErrors = e;
      pathParameters = validationResult.pathParametersErrors.value;
      validationResult.message = e.message;
    }
  }

  return await handler({
    validationResult,
    queryStringParameters,
    payload,
    pathParameters,
  });
};
