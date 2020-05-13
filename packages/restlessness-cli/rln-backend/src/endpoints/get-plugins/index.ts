import 'module-alias/register';
import handler from './handler';
import { requestParser } from '@restlessness/core';
import { res, StatusCodes } from '@restlessness/core';
import validations from './validations';

export default async (event: AWSLambda.APIGatewayProxyEventBase<null>, context: AWSLambda.Context) => {
  const {
    validationResult,
    queryStringParameters,
  } = await requestParser(event, context, validations);

  return await handler({
    validationResult,
    queryStringParameters,
  });
};
