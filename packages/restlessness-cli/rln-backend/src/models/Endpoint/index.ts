import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot, getEndpointsRoot, getSrcRoot } from 'root/services/path-resolver';
import { handlerTemplate, indexTemplate, interfacesTemplate, exporterTemplate } from 'root/models/Endpoint/templates';
import { capitalize } from 'root/services/util';
import Route from 'root/models/Route';

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

interface JsonEndpoint {
  id: number,
  route: string,
  method: HttpMethod
}

export default class Endpoint {
  id: number
  route: Route
  method: HttpMethod

  static get endpointsJsonPath(): string {
    return path.join(getPrjRoot(), 'endpoints.json');
  }

  static get functionsJsonPath(): string {
    return path.join(getPrjRoot(), 'functions.json');
  }

  static async getList(): Promise<Endpoint[]> {
    const file = await fs.readFile(Endpoint.endpointsJsonPath);
    const endpoints: JsonEndpoint[] = JSON.parse(file.toString());
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
    }));
    await fs.writeFile(Endpoint.endpointsJsonPath, JSON.stringify(jsonEndpoints, null, 2));
  }

  async create(route: Route, method: HttpMethod) {
    this.route = route;
    this.method = method;
    const endpoints = await Endpoint.getList();
    this.id = (endpoints
      .map(endpoint => endpoint.id)
      .reduce((max, curr) => Math.max(max, curr), 0) || 0) + 1;
    endpoints.push(this);
    await Endpoint.saveList(endpoints);
    if (!fsSync.existsSync(getEndpointsRoot())) {
      await fs.mkdir(getEndpointsRoot());
    }
    const routeVars = route.vars;
    const hasPayload = [HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT].includes(this.method);
    const folderPath = path.join(getEndpointsRoot(), this.method + '-' + route.folderName);
    await fs.mkdir(folderPath);
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(hasPayload, routeVars));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate(hasPayload, routeVars));
    await fs.writeFile(path.join(folderPath, 'interfaces.ts'), interfacesTemplate(hasPayload, routeVars));
    await fs.writeFile(path.join(getSrcRoot(), 'exporter.ts'), exporterTemplate(endpoints));
    const functions = await Endpoint.getFunctions();
    const functionName = this.method + route.functionName;
    functions[functionName] = {
      handler: `dist/exporter.${functionName}`,
      events: [
        {
          http: {
            path: route.functionPath,
            method: this.method,
            cors: true,
          },
        },
      ],
    };
    await Endpoint.saveFunctions(functions);
  }

  static async getFunctions(): Promise<any[]> {
    const file = await fs.readFile(Endpoint.functionsJsonPath);
    return JSON.parse(file.toString()).functions;
  }

  static async saveFunctions(functions) {
    await fs.writeFile(Endpoint.functionsJsonPath, JSON.stringify({ functions }, null, 2));
  }
}
