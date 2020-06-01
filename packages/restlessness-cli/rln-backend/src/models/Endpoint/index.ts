import Route from 'root/models/Route';
import { Authorizer } from 'root/models';
import { JsonEndpoint } from '@restlessness/utilities';

enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
  PATCH = 'patch'
}

export {
  HttpMethod,
};

export default class Endpoint {
  id: string
  route: Route
  method: HttpMethod
  authorizer: Authorizer

  static async getList(): Promise<Endpoint[]> {
    const endpoints: JsonEndpoint[] = await JsonEndpoint.getList<JsonEndpoint>();
    return endpoints.map(endpoint => {
      const ep = new Endpoint();
      ep.id = endpoint.id;
      ep.route = Route.parseFromText(endpoint.route);
      ep.method = endpoint.method;
      return ep;
    });
  }

  static async saveList(endpoints: Endpoint[]) {
    const jsonEndpoints: JsonEndpoint[] = endpoints.map(ep => ({
      ...ep,
      route: ep.route.endpointRoute,
      authorizerId: ep.authorizer?.id ?? null,
    }));
    await JsonEndpoint.saveList<JsonEndpoint>(jsonEndpoints);
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string) {
    await JsonEndpoint.create(route.endpointRoute, method, authorizerId);
  }

  static async getFunctions(): Promise<any[]> {
    return await JsonEndpoint.getFunctions();
  }

  static async saveFunctions(functions) {
    await JsonEndpoint.saveFunctions(functions);
  }
}
