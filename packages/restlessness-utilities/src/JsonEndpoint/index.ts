import fsSync, { promises as fs } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import {
  handlerTemplate,
  indexTemplate,
  interfacesTemplate,
  exporterTemplate,
  validationsTemplate,
  testTemplate,
} from '../JsonEndpoint/templates';
import Route from '../Route';
import JsonAuthorizer from '../JsonAuthorizer';
import JsonFile from '../JsonFile';
import JsonFunction, { FunctionEndpoint } from '../JsonFunction';

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

    // Add e new function handler in functions.json read by serverless.yml
    // It also adds the authorizer handler, if it doesn't exist yet
    await JsonFunction.addEndpoint(functionName, route.functionPath, method, authorizerId);
  }

  static async remote(functionName: string) {
    const functionEndpoint: FunctionEndpoint = await JsonFunction.getEndpoint(functionName);
    if (!functionEndpoint) {
      throw new Error('Endpoint not found in functions.js');
    }

  }
}
