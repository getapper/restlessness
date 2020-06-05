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
} from './/templates';
import Route from '../Route';
import JsonAuthorizers from '../JsonAuthorizers';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import JsonFunctions, { FunctionEndpoint } from '../JsonFunctions';
import { promisify } from 'util';
import rimraf from 'rimraf';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
  PATCH = 'patch'
}

export interface JsonEndpointsEntry extends JsonConfigEntry {
  route: string
  method: HttpMethod
  authorizerId?: string
}

class JsonEndpoints extends JsonConfigFile<JsonEndpointsEntry> {
  get jsonPath(): string {
    return PathResolver.getEndpointsConfigPath;
  }

  async create(routePath: string, method: HttpMethod, authorizerId?: string): Promise<JsonEndpointsEntry> {
    const route = Route.parseFromText(routePath);
    const jsonEndpointsEntry: JsonEndpointsEntry = {
      id: method + route.functionName,
      route: routePath,
      method: method,
    };
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    if (authorizerId) {
      if (!jsonAuthorizersEntry) {
        throw new Error('Authorizer not found');
      }
      jsonEndpointsEntry.authorizerId = authorizerId;
    }
    await this.addEntry(jsonEndpointsEntry);

    /**
     * SIDE EFFECTS
     */

    // Generate new endpoint folder
    if (!fsSync.existsSync(PathResolver.getEndpointsPath)) {
      await fs.mkdir(PathResolver.getEndpointsPath);
    }
    const routeVars = route.vars;
    const hasPayload = [HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT].includes(method);
    const folderPath = path.join(PathResolver.getEndpointsPath, method + '-' + route.folderName);
    await fs.mkdir(folderPath);
    const functionName = method + route.functionName;
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(hasPayload, routeVars, jsonAuthorizersEntry));
    await fs.writeFile(path.join(folderPath, 'index.test.ts'), testTemplate(functionName, jsonAuthorizersEntry));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate(hasPayload, routeVars, jsonAuthorizersEntry));
    await fs.writeFile(path.join(folderPath, 'interfaces.ts'), interfacesTemplate(hasPayload, routeVars, jsonAuthorizersEntry));
    await fs.writeFile(path.join(folderPath, 'validations.ts'), validationsTemplate(hasPayload, routeVars));

    // Re-generate exporter file with considering the new endpoint
    await this.generateExporter();

    // Add e new function handler in functions.json read by serverless.yml
    // It also adds the authorizer handler, if it doesn't exist yet
    await JsonFunctions.addEndpoint(functionName, route.functionPath, method, authorizerId);
    return jsonEndpointsEntry;
  }

  async removeById(id: string) {
    const jsonEndpointsEntry: JsonEndpointsEntry = await this.getEntryById(id);
    await this.removeEntryById(id);

    /**
     * SIDE EFFECTS
     */

    // Delete endpoint folder
    const route = Route.parseFromText(jsonEndpointsEntry.route);
    const folderPath = path.join(PathResolver.getEndpointsPath, jsonEndpointsEntry.method + '-' + route.folderName);
    await promisify(rimraf)(folderPath);

    // Re-generate exporter file with considering the new endpoint
    await this.generateExporter();

    // Renove function handler in functions.json read by serverless.yml
    await JsonFunctions.removeEndpoint(id);
  }

  private async generateExporter(): Promise<void> {
    await this.read();
    const routes: Route[] = this.entries.sort().map(je => Route.parseFromText(je.route));
    const methods: string[] = this.entries.map(je => je.method);
    await fs.writeFile(path.join(PathResolver.getSrcPath, 'exporter.ts'), exporterTemplate(methods, routes));
  }
}

export default new JsonEndpoints();
