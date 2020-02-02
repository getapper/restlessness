import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot } from 'root/services/path-resolver';

enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
  PATCH = 'patch'
}

export default class Endpoint {
  id: number
  route: string
  method: HttpMethod

  static get endpointsJsonPath(): string {
    return path.join(getPrjRoot(), 'endpoints.json');
  }

  static async getList(): Promise<Endpoint[]> {
    const file = await fs.readFile(Endpoint.endpointsJsonPath);
    const endpoints = JSON.parse(file.toString());
    return endpoints.map(endpoint => {
      const ep = new Endpoint();
      ep.id = endpoint.id;
      ep.route = endpoint.route;
      ep.method = endpoint.method;
      return ep;
    });
  }

  static async saveList(endpoints: Endpoint[]) {
    await fs.writeFile(Endpoint.endpointsJsonPath, JSON.stringify(endpoints, null, 4));
  }

  async save() {
    const endpoints = await Endpoint.getList();
    this.id = (endpoints
      .map(endpoint => endpoint.id)
      .reduce((max, curr) => Math.max(max, curr), 0) || 0) + 1;
    endpoints.push(this);
    await Endpoint.saveList(endpoints);
    // @TODO: create folders and entry inside functions.json
  }
}
