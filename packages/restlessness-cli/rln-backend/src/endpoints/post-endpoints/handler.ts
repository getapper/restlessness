require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';
import Endpoint from 'root/models/Endpoint';

export default async (req: Request) => {
  const {
    payload,
  } = req;
  const {
    route,
    method,
  } = payload;
  const cleanRoute: string = '/' + route
    .toLowerCase()
    .split('/')
    .filter(p => p !== '')
    .join('/');
  const endpoints = await Endpoint.getList();
  if (~endpoints.findIndex(ep => ep.route === cleanRoute && ep.method === method)) {
    return res({ message: 'Route already exists' }, 400);
  }
  const endpoint = new Endpoint();
  await endpoint.create(cleanRoute, method);
  return res(endpoint);
};
