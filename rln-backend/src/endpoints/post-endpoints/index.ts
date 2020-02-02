require('module-alias/register');
import res from 'root/services/response-handler';
import Endpoint from 'root/models/Endpoint';

export default async (event, context) => {
  // @TODO: Add lib request parser
  const payload = JSON.parse(event.body);
  // @TODO: Add payload Joi validator
  const endpoint: Endpoint = new Endpoint();
  endpoint.route = payload.route;
  endpoint.method = payload.method;
  // @TODO: Check route and method couple doesn't exist yet
  await endpoint.save();
  return res(
    endpoint
  );
};
