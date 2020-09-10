import { Authorizer, BaseModel, Route, Dao } from '../';
import { JsonEndpoints, JsonEndpointsEntry, HttpMethod } from '@restlessness/core';

export default class Endpoint extends BaseModel {
  id: string
  safeFunctionName: string
  route: Route
  method: HttpMethod
  authorizer: Authorizer
  daos: Dao[]
  warmupEnabled: boolean

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
      this.warmupEnabled = entry.warmupEnabled;
  }

  protected async toConfigEntry(): Promise<JsonEndpointsEntry> {
    return {
      id: this.id,
      safeFunctionName: this.safeFunctionName,
      route: this.route.endpointRoute,
      method: this.method,
      authorizerId: this.authorizer?.id,
      daoIds: this.daos.map(dao => dao.id),
      warmupEnabled: this.warmupEnabled,
    };
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string, daoIds?: string[], warmupEnabled?: boolean) {
    const entry = await JsonEndpoints.create(route.endpointRoute, method, authorizerId, daoIds, warmupEnabled);
    await this.fromConfigEntry(entry);
  }
}
