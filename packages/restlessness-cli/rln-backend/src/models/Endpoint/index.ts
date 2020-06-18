import { Authorizer, BaseModel, Route, Dao } from '../';
import { JsonEndpoints, JsonEndpointsEntry, HttpMethod } from '@restlessness/utilities';

export default class Endpoint extends BaseModel {
  id: string
  safeFunctionName: string
  route: Route
  method: HttpMethod
  authorizer: Authorizer
  daos: Dao[]

  static get model() {
    return JsonEndpoints;
  }

  protected async fromConfigEntry(entry: JsonEndpointsEntry): Promise<void> {
      this.id = entry.id;
      this.safeFunctionName = entry.safeFunctionName;
      this.route = Route.parseFromText(entry.route);
      this.method = entry.method;
      this.authorizer = await Authorizer.getById(entry.authorizerId);
      const daos = entry.daoIds?.map(id => Dao.getById(id));
      this.daos = daos ? await Promise.all(daos) : [];
  }

  protected async toConfigEntry(): Promise<JsonEndpointsEntry> {
    return {
      id: this.id,
      safeFunctionName: this.safeFunctionName,
      route: this.route.endpointRoute,
      method: this.method,
      authorizerId: this.authorizer?.id,
      daoIds: this.daos.map(dao => dao.id),
    };
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string, daoIds?: string[]) {
    const entry = await JsonEndpoints.create(route.endpointRoute, method, authorizerId, daoIds);
    await this.fromConfigEntry(entry);
  }
}
