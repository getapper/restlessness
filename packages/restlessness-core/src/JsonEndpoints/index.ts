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
} from './templates';
import Route from '../Route';
import JsonAuthorizers from '../JsonAuthorizers';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import JsonServices from '../JsonServices';
import { promisify } from 'util';
import rimraf from 'rimraf';
import JsonDaos from '../JsonDaos';
import { AuthorizerPackage } from '../AuthorizerPackage';
import Misc from '../Misc';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
  PATCH = 'patch'
}

export interface JsonEndpointsEntry extends JsonConfigEntry {
  route: string
  safeFunctionName: string
  description?: string
  method: HttpMethod
  authorizerId?: string
  daoIds?: string[]
  warmupEnabled: boolean
  serviceName: string
}

class JsonEndpoints extends JsonConfigFile<JsonEndpointsEntry> {
  get jsonPath(): string {
    return PathResolver.getEndpointsConfigPath;
  }

  async create(endpoint: {
    routePath: string, method: HttpMethod, authorizerId?: string, daoIds?: string[], warmupEnabled?: boolean, serviceName: string
  }): Promise<JsonEndpointsEntry> {
    const { routePath, method, authorizerId, daoIds, warmupEnabled, serviceName } = endpoint;

    const route = Route.parseFromText(routePath);
    const id = method + route.functionName;

    await JsonServices.read();
    const fullServiceName = JsonServices.services[serviceName].service;
    const safeFunctionName = Misc.createAwsSafeFunctionName(id, fullServiceName);

    const jsonEndpointsEntry: JsonEndpointsEntry = {
      id: method + route.functionName,
      safeFunctionName,
      route: routePath,
      method: method,
      authorizerId: null,
      daoIds: null,
      warmupEnabled,
      serviceName,
    };
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    let authorizerPackage: AuthorizerPackage = null;
    if (authorizerId) {
      if (!jsonAuthorizersEntry) {
        throw new Error('Authorizer not found');
      }
      jsonEndpointsEntry.authorizerId = authorizerId;
      authorizerPackage = AuthorizerPackage.load(jsonAuthorizersEntry.package);
    }

    if (daoIds?.length) {
      for (const id of daoIds) {
        if (!await JsonDaos.getEntryById(id)) {
          throw new Error(`Dao with id ${id} not found`);
        }
      }
      jsonEndpointsEntry.daoIds = [...daoIds];
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
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(jsonEndpointsEntry));
    await fs.writeFile(path.join(folderPath, 'index.test.ts'), testTemplate(jsonEndpointsEntry, authorizerPackage));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate(hasPayload, routeVars, authorizerPackage));
    await fs.writeFile(path.join(folderPath, 'interfaces.ts'), interfacesTemplate(hasPayload, routeVars, authorizerPackage));
    await fs.writeFile(path.join(folderPath, 'validations.ts'), validationsTemplate(hasPayload, routeVars));

    // Re-generate exporter file with considering the new endpoint
    await this.generateExporter();

    // Add e new function handler in serverless service json that will be deployed
    // It also adds the authorizer handler, if it doesn't exist yet
    await JsonServices.addEndpoint({
      safeFunctionName: jsonEndpointsEntry.safeFunctionName,
      functionPath: route.functionPath,
      method,
      authorizerId,
      warmupEnabled,
      serviceName,
    });
    return jsonEndpointsEntry;
  }

  async removeEntryById(id: string) {
    const jsonEndpointsEntry: JsonEndpointsEntry = await this.getEntryById(id);
    await super.removeEntryById(id);

    /**
     * SIDE EFFECTS
     */

    // Delete endpoint folder
    const route = Route.parseFromText(jsonEndpointsEntry.route);
    const folderPath = path.join(PathResolver.getEndpointsPath, jsonEndpointsEntry.method + '-' + route.folderName);
    await promisify(rimraf)(folderPath);

    // Re-generate exporter file after removing the endpoint
    await this.generateExporter();

    // Remove function handler in serverless.json read by serverless.yml
    await JsonServices.removeEndpoint(jsonEndpointsEntry.serviceName, jsonEndpointsEntry.safeFunctionName);
  }

  private async generateExporter(): Promise<void> {
    await this.read();
    const routes: Route[] = this.entries.sort().map(je => Route.parseFromText(je.route));
    const methods: string[] = this.entries.map(je => je.method);
    await fs.writeFile(path.join(PathResolver.getSrcPath, 'exporter.ts'), exporterTemplate(this.entries, methods, routes));
  }

  async updateEntry(entry: JsonEndpointsEntry) {
    const jsonEndpointsEntry = await this.getEntryById(entry.id);
    if (entry.daoIds?.length) {
      for (const id of entry.daoIds) {
        if (!await JsonDaos.getEntryById(id)) {
          throw new Error(`Dao with id ${id} not found`);
        }
      }
      jsonEndpointsEntry.daoIds = [...entry.daoIds];
    } else {
      jsonEndpointsEntry.daoIds = [];
    }
    if (entry.authorizerId && !(await JsonAuthorizers.getEntryById(entry.authorizerId))) {
      throw new Error('Authorizer not found');
    }
    jsonEndpointsEntry.authorizerId = entry.authorizerId;
    jsonEndpointsEntry.warmupEnabled = entry.warmupEnabled;
    const currentServiceName = jsonEndpointsEntry.serviceName;
    jsonEndpointsEntry.serviceName = entry.serviceName;

    await super.updateEntry(jsonEndpointsEntry);

    // side effects
    await JsonServices.read();
    if (currentServiceName !== jsonEndpointsEntry.serviceName) {
      await JsonServices.changeEndpointService(currentServiceName, jsonEndpointsEntry.serviceName, jsonEndpointsEntry.safeFunctionName);
    }
    await JsonServices.updateEndpoint(
      jsonEndpointsEntry.serviceName,
      jsonEndpointsEntry.safeFunctionName,
      jsonEndpointsEntry.authorizerId,
      jsonEndpointsEntry.warmupEnabled,
    );
  }
}

export default new JsonEndpoints();
