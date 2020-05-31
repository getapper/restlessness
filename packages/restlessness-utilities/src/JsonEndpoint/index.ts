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
} from 'root/JsonEndpoint/templates';
import Route from 'root/Route';
import JsonAuthorizer from 'root/JsonAuthorizer';
import JsonFile from 'root/JsonFile';

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

export default class JsonEndpoint extends JsonFile {
  id: string
  route: string
  method: HttpMethod
  authorizerId: string

  static async create(routePath: string, method: HttpMethod, authorizerId?: string): Promise<void> {
    const route = Route.parseFromText(routePath);
    const jsonEndpoint = new JsonEndpoint();
    jsonEndpoint.id = method + route.functionName;
    jsonEndpoint.route = routePath;
    jsonEndpoint.method = method;
    const jsonAuthorizers = await JsonAuthorizer.getList<JsonAuthorizer>();
    if (authorizerId) {
      if (!jsonAuthorizers.map(ja => ja.id).includes(authorizerId)) {
        throw new Error('Authorizer not found');
      }
      jsonEndpoint.authorizerId = authorizerId;
    }
    await JsonEndpoint.addEntry(jsonEndpoint);
    if (!fsSync.existsSync(PathResolver.getEndpointsPath)) {
      await fs.mkdir(PathResolver.getEndpointsPath);
    }

    /**
     * SIDE EFFECTS
     */

    // Generate new endpoint folder
    const jsonAuthorizer = await JsonAuthorizer.getById<JsonAuthorizer>(jsonEndpoint.authorizerId);
    const routeVars = route.vars;
    const hasPayload = [HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT].includes(method);
    const folderPath = path.join(PathResolver.getEndpointsPath, method + '-' + route.folderName);
    await fs.mkdir(folderPath);
    const functionName = method + route.functionName;
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(hasPayload, routeVars, jsonAuthorizer));
    await fs.writeFile(path.join(folderPath, 'index.test.ts'), testTemplate(functionName, jsonAuthorizer));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate(hasPayload, routeVars, jsonAuthorizer));
    await fs.writeFile(path.join(folderPath, 'interfaces.ts'), interfacesTemplate(hasPayload, routeVars, jsonAuthorizer));
    await fs.writeFile(path.join(folderPath, 'validations.ts'), validationsTemplate(hasPayload, routeVars));

    // Re-generate exporter file with considering the new endpoint
    const jsonEndpoints = await JsonEndpoint.getList<JsonEndpoint>();
    const routes: Route[] = jsonEndpoints.sort().map(je => Route.parseFromText(je.route));
    const methods: string[] = jsonEndpoints.map(je => je.method);
    await fs.writeFile(path.join(PathResolver.getSrcPath, 'exporter.ts'), exporterTemplate(methods, routes));

    // @TODO: Create new entry in functions.json file
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