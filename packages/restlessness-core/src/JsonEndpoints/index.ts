import fsSync, { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
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
import JsonServerless, { FunctionEndpoint } from '../JsonServerless';
import JsonServices from '../JsonServices';
import { promisify } from 'util';
import rimraf from 'rimraf';
import JsonDaos from '../JsonDaos';
import { AuthorizerPackage } from '../AuthorizerPackage';

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

    /**
     * The 4 xxxx stand for "dev" or "prod", based on which stage deployment will be selected
     * We use 4 x for worst case scenario, that is "prod", since we need to check this string length
     * and to avoid it will reach 64 chars, since AWS complains about that
     */
    let safeFunctionName: string = id;
    const awsLambdaName: string = `${id}LambdaFunction`;
    if (awsLambdaName.length > 63) {
      const hash = crypto.createHash('md5').update(id).digest('hex');
      safeFunctionName = `${id.substring(0, 21)}${hash.substring(0, 3)}${id.substring(id.length - 21)}`;
    }
    const awsFunctionName: string = `${JsonServerless.service}-xxxx-${id}`;
    if (awsFunctionName.length > 63) {
      const hash = crypto.createHash('md5').update(id).digest('hex');
      const chars = Math.floor((64 - `${JsonServerless.service}-xxxx-`.length - 10) / 2);
      safeFunctionName = `${id.substring(0, chars)}${hash.substring(0, 3)}${id.substring(id.length - chars)}`;
    }

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

    // Add e new function handler in serverless.json read by serverless.yml
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

    // Renove function handler in serverless.json read by serverless.yml
    await JsonServerless.removeEndpoint(jsonEndpointsEntry.safeFunctionName);
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

    await super.updateEntry(jsonEndpointsEntry);

    // side effects

    await JsonServerless.read();
    await JsonServerless.updateEndpoint(
      jsonEndpointsEntry.safeFunctionName,
      jsonEndpointsEntry.authorizerId,
      jsonEndpointsEntry.warmupEnabled,
    );
  }
}

export default new JsonEndpoints();
