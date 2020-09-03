import { ValidationObjects, ValidationResult, RequestI } from './interfaces';
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
} from '../';
import AWSLambda from 'aws-lambda';

export * from './interfaces';

export const LambdaHandler = async <T  extends AuthorizerContext, Q, P, PP>(
  handler: (req: RequestI<Q, P, PP>) => any,
  validationsBuilder: () => ValidationObjects,
  apiName: string,
  event: AWSLambda.APIGatewayProxyEventBase<T>,
  context: AWSLambda.Context,
) => {
  EnvironmentHandler.load();
  let parsedSession;

  // @TODO: Check Plugins beforeLambdas hooks
  const jsonEndpointsEntry = await JsonEndpoints.getEntryById(apiName);
  if (jsonEndpointsEntry) {
    if (jsonEndpointsEntry.daoIds?.length) {
      for (const daoId of jsonEndpointsEntry.daoIds)  {
        const jsonDaoEntry: JsonDaosEntry = await JsonDaos.getEntryById(daoId);
        try {
          const daoPackage: DaoPackage = DaoPackage.load(jsonDaoEntry.package);
          await daoPackage.beforeLambda(event, context);
        } catch (e) {
          console.error(`Error when calling beforeLambda hook on dao: ${jsonDaoEntry.name} (${jsonDaoEntry.id})`, e);
        }
      }
    }

    // @ts-ignore
    if (event.source === 'serverless-plugin-warmup') {
      console.log('WarmUP - Lambda is warm!');
      return 'Lambda is warm!';
    }

    if (jsonEndpointsEntry.authorizerId) {
      const jsonAuthorizersEntry: JsonAuthorizersEntry = await JsonAuthorizers.getEntryById(jsonEndpointsEntry.authorizerId);
      const authorizerPackage: AuthorizerPackage = AuthorizerPackage.load(jsonAuthorizersEntry.package);
      try {
        await authorizerPackage.beforeLambda(event, context);
      } catch (e) {
        console.error(`Error when calling beforeLambda hook on authorizer: ${jsonAuthorizersEntry.name} (${jsonAuthorizersEntry.package})`, e);
      }

      try {
        parsedSession = await authorizerPackage.parseSession(event?.requestContext?.authorizer?.serializedSession);
      } catch(e) {
        console.error('Error parsing serialized session', e);
      }
    }
  } else {
    console.error(`Cannot find Endpoint identified by ${apiName}`);
  }

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
  })
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
    session: parsedSession,
  });
};
