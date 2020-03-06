require('module-alias/register');
import handler from './handler';
import { requestParser } from '@restlessness/core';

export default async (event, context) => {
  const {
    queryStringParameters,
    payload,
  } = requestParser(event);
  return await handler({
    queryStringParameters,
    payload,
  });
};