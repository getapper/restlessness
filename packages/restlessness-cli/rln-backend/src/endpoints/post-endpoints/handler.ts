require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';
import { Endpoint, Route } from 'root/models';

export default async (req: Request) => {
  const {
    payload,
  } = req;
  const {
    route: text,
    method,
    authorizerId,
  } = payload;
  let route: Route;
  try {
    route = Route.parseFromText(text);
  } catch (e) {
    return res({ message: e.message }, 400);
  }
  const endpoints = await Endpoint.getList();
  if (~endpoints.findIndex(ep => ep.route.endpointRoute === route.endpointRoute && ep.method === method)) {
    return res({ message: 'Route already exists' }, 400);
  }
  const endpoint = new Endpoint();
  await endpoint.create(route, method, authorizerId);
  return res(endpoint);
};
