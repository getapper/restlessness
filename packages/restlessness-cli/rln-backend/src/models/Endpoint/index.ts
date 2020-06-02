import Route from 'root/models/Route';
import { Authorizer } from 'root/models';
import { JsonEndpoints, JsonEndpointsEntry } from '@restlessness/utilities';
import {AuthorizerEntry} from 'root/models/Authorizer';
import UiModel from 'root/models/UiModel'

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

export interface EndpointEntry {
  id: string
  route: Route
  method: HttpMethod
  authorizer: AuthorizerEntry
}

class Endpoint extends UiModel<typeof JsonEndpoints, JsonEndpointsEntry, EndpointEntry>{

  protected async mapModelToUi(entry: JsonEndpointsEntry): Promise<EndpointEntry> {
    return {
      id: entry.id,
      route: Route.parseFromText(entry.route),
      method: entry.method,
      authorizer: await Authorizer.getById(entry.authorizerId),
    };
  }

  protected async mapUiToModel(entry: EndpointEntry): Promise<JsonEndpointsEntry> {
    return {
      id: entry.id,
      route: entry.route.endpointRoute,
      method: entry.method,
      authorizerId: entry.authorizer?.id,
    };
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string): Promise<EndpointEntry> {
    return await this.mapModelToUi(await this.model.create(route.endpointRoute, method, authorizerId));
  }

  // static async getFunctions(): Promise<any[]> {
  //   return await JsonEndpoint.getFunctions();
  // }
  //
  // static async saveFunctions(functions) {
  //   await JsonEndpoint.saveFunctions(functions);
  // }
}

export default new Endpoint(JsonEndpoints);
