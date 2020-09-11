import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint, Route } from '../../models';

export default async (req: Request) => {
  const {
    payload,
  } = req;
  const {
    route: text,
    method,
    authorizerId,
    daoIds,
    warmupEnabled,
  } = payload;
  let route: Route;
  try {
    route = Route.parseFromText(text);
  } catch (e) {
    return ResponseHandler.json({ message: e.message }, StatusCodes.BadRequest);
  }
  const endpoints = await Endpoint.getList();
  if (~endpoints.findIndex(ep => ep.route.endpointRoute === route.endpointRoute && ep.method === method)) {
    return ResponseHandler.json({ message: 'Route already exists' }, StatusCodes.BadRequest);
  }
  const endpoint = new Endpoint();
  await endpoint.create(route, method, authorizerId, daoIds, warmupEnabled);
  return ResponseHandler.json(endpoint);
};
