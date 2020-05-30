import fsSync, { promises as fs } from 'fs';
import path from 'path';
import PathResolver from 'root/PathResolver';
import {
  handlerTemplate,
  indexTemplate,
  interfacesTemplate,
  exporterTemplate,
  validationsTemplate,
  testTemplate,
} from 'root/Endpoint/templates';
import Route from 'root/Route';
import Authorizer from 'root/Authorizer';

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
  authorizer: string
}

export default class Endpoint {
  id: number
  route: Route
  method: HttpMethod
  authorizer: Authorizer

  static async getList(): Promise<Endpoint[]> {
    const file = await fs.readFile(PathResolver.getEndpointsConfigPath);
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
      authorizer: ep.authorizer?.id ?? null,
    }));
    await fs.writeFile(PathResolver.getEndpointsConfigPath, JSON.stringify(jsonEndpoints, null, 2));
  }

  async create(route: Route, method: HttpMethod, authorizerId?: string) {
    this.route = route;
    this.method = method;
    const endpoints = await Endpoint.getList();
    const authorizers = await Authorizer.getList();
    if (authorizerId) {
      this.authorizer = authorizers.find(authorizer => authorizer.id === authorizerId);
    } else {
      this.authorizer = null;
    }
    this.id = (endpoints
      .map(endpoint => endpoint.id)
      .reduce((max, curr) => Math.max(max, curr), 0) || 0) + 1;
    endpoints.push(this);
    await Endpoint.saveList(endpoints);
    if (!fsSync.existsSync(PathResolver.getEndpointsPath)) {
      await fs.mkdir(PathResolver.getEndpointsPath);
    }
    const routeVars = route.vars;
    const hasPayload = [HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT].includes(this.method);
    const folderPath = path.join(PathResolver.getEndpointsPath, this.method + '-' + route.folderName);
    await fs.mkdir(folderPath);
    const functionName = this.method + route.functionName;
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(hasPayload, routeVars, this.authorizer));
    await fs.writeFile(path.join(folderPath, 'index.test.ts'), testTemplate(functionName, this.authorizer));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate(hasPayload, routeVars, this.authorizer));
    await fs.writeFile(path.join(folderPath, 'interfaces.ts'), interfacesTemplate(hasPayload, routeVars, this.authorizer));
    await fs.writeFile(path.join(folderPath, 'validations.ts'), validationsTemplate(hasPayload, routeVars));
    await fs.writeFile(path.join(PathResolver.getSrcPath, 'exporter.ts'), exporterTemplate(endpoints));
    const functions = await Endpoint.getFunctions();

    let endpointFunction = {
      handler: `dist/exporter.${functionName}`,
      events: [
        {
          http: {
            path: route.functionPath,
            method: this.method,
            cors: true,
            authorizer: null,
          },
        },
      ],
    };
    if (this.authorizer) {
      endpointFunction.events[0].http.authorizer = this.authorizer.id;
      if (!functions[this.authorizer.id]) {
        functions[this.authorizer.id] = {
          handler: `dist/authorizers/${this.authorizer.id}.handler`,
        };
      }
    }
    functions[functionName] = endpointFunction;
    /*
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
    */
    await Endpoint.saveFunctions(functions);
  }

  static async getFunctions(): Promise<any[]> {
    const file = await fs.readFile(PathResolver.getFunctionsConfigPath);
    return JSON.parse(file.toString()).functions;
  }

  static async saveFunctions(functions) {
    await fs.writeFile(PathResolver.getFunctionsConfigPath, JSON.stringify({ functions }, null, 2));
  }
}
