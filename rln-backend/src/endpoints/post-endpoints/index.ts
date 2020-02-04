require('module-alias/register');
import handler from './handler';

export default async (event, context) => {
  // @TODO: Add lib request parser
  // @TODO: Add payload Joi validator
  const payload = JSON.parse(event.body);
  return await handler({ payload });
};
