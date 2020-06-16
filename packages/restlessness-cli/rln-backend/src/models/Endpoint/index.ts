import { Authorizer, BaseModel, Route } from '../';
import { JsonEndpoints, JsonEndpointsEntry, HttpMethod } from '@restlessness/utilities';

export default class Endpoint extends BaseModel {
  id: string
  route: Route
  method: HttpMethod
  authorizer: Authorizer

  static get model() {
    return JsonEndpoints;
  }

  protected async fromConfigEntry(entry: JsonEndpointsEntry): Promise<void> {
      this.id = entry.id;
      this.route = Route.parseFromText(entry.route);
      this.method = entry.method;
      this.authorizer = await Authorizer.getById(entry.authorizerId);
  }

  protected async toConfigEntry(): Promise<JsonEndpointsEntry> {
    return {
      id: this.id,
      route: this.route.endpointRoute,
      method: this.method,
      authorizerId: this.authorizer?.id,
    };
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string) {
    const entry = await JsonEndpoints.create(route.endpointRoute, method, authorizerId);
    await this.fromConfigEntry(entry);
  }
}
