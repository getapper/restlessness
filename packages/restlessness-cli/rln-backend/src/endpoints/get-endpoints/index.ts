require('module-alias/register');
import handler from './handler';
import validations from './validations';
import { requestParser } from '@restlessness/core';

export default async (event, context) => {
  const {
    payload,
  } = await requestParser(event, context, validations);
  return await handler({ payload });
};
