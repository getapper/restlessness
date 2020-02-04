import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot, getEndpointsRoot } from 'root/services/path-resolver';
import { handlerTemplate, indexTemplate, interfacesTemplate } from 'root/models/Endpoint/templates';
import { capitalize } from 'root/services/util';

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
  id: number
  route: string
  method: HttpMethod

  static get endpointsJsonPath(): string {
    return path.join(getPrjRoot(), 'endpoints.json');
  }

  static get functionsJsonPath(): string {
    return path.join(getPrjRoot(), 'functions.json');
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
    await fs.writeFile(Endpoint.endpointsJsonPath, JSON.stringify(endpoints, null, 2));
  }

  get folderName(): string {
    const formattedRoute = this.route
      .split('/')
      .filter(p => p !== '')
      .join('-');
    return `${this.method}-${formattedRoute}`;
  }

  get folderPath(): string {
    return path.join(getEndpointsRoot(), this.folderName);
  }

  async create(route: string, method: HttpMethod) {
    this.route = route;
    this.method = method;
    const endpoints = await Endpoint.getList();
    this.id = (endpoints
      .map(endpoint => endpoint.id)
      .reduce((max, curr) => Math.max(max, curr), 0) || 0) + 1;
    endpoints.push(this);
    await Endpoint.saveList(endpoints);
    // @TODO: create folders and entry inside functions.json
    await fs.mkdir(this.folderPath);
    await fs.writeFile(path.join(this.folderPath, 'index.ts'), indexTemplate());
    await fs.writeFile(path.join(this.folderPath, 'handler.ts'), handlerTemplate());
    await fs.writeFile(path.join(this.folderPath, 'interfaces.ts'), interfacesTemplate());
    const functions = await Endpoint.getFunctions();
    const functionName = this.method + this.route
      .split('/')
      .filter(p => p !== '')
      .map(p =>  capitalize(p))
      .join('');
    const functionPath = this.route
      .split('/')
      .filter(p => p !== '')
      .join('/');
    functions[functionName] = {
      handler: `dist/handler.${functionName}`,
      events: [
        {
          http: {
            path: functionPath,
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
