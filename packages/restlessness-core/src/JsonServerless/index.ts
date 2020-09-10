import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers from '../JsonAuthorizers';
import _unset from 'lodash.unset';
import path from 'path';

interface Functions {
  [key: string]: FunctionEndpoint
}

interface Event {
  http: {
    path: string,
    method: HttpMethod,
    cors: boolean,
    authorizer?: string
  }
}

export interface FunctionEndpoint {
  handler: string,
  events?: Event[],
  warmup?: {[key: string]: any, enabled: boolean}
}

class JsonServerless {
  service: string
  provider: {[key: string]: any}
  plugins: string[]
  functions: Functions

  get jsonPath(): string {
    return PathResolver.getServerlessJsonPath;
  }

  async read(): Promise<void> {
    const file = await fs.readFile(this.jsonPath);
    Object.assign(this, JSON.parse(file.toString()));
  }

  async save(): Promise<void> {
    await fs.writeFile(this.jsonPath, JSON.stringify(this, null, 2));
  }

  async addEndpoint(
    safeFunctionName: string,
    functionPath: string,
    method: HttpMethod,
    authorizerId?: string,
    warmupEnabled = true,
  ) {
    await this.read();

    const functionEndpoint: FunctionEndpoint = {
      handler: `dist/exporter.${safeFunctionName}`,
      events: [
        {
          http: {
            path: functionPath,
            method: method,
            cors: true,
            authorizer: null,
          },
        },
      ],
      warmup: {
        enabled: warmupEnabled,
      },
    };
    if (authorizerId) {
      functionEndpoint.events[0].http.authorizer = authorizerId;
      if (!this.functions[authorizerId]) {
        await this.createAuthorizerFunction(authorizerId);
      }
    }
    this.functions[safeFunctionName] = functionEndpoint;
    await this.save();
  }

  async createAuthorizerFunction(authorizerId: string) {
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    try {
      const entry = require(path.join(PathResolver.getNodeModulesPath, jsonAuthorizersEntry.package, 'package.json')).main;
      const absolutePath = path.join(PathResolver.getNodeModulesPath, jsonAuthorizersEntry.package, `${entry}.authorizer`);
      const handlerRelativePath = path.relative(PathResolver.getPrjPath, absolutePath);
      this.functions[authorizerId] = {
        handler: handlerRelativePath,
      };
    } catch {
      throw new Error(`Cannot find authorizer ${jsonAuthorizersEntry?.package}!`);
    }
  }

  async setAuthorizer(functionName: string, authorizerId: string) {
    if (!authorizerId) {
      return;
    }
    if (!this.functions[authorizerId]) {
      await this.createAuthorizerFunction(authorizerId);
    }
    this.functions[functionName].events[0].http.authorizer = authorizerId;
  }

  async getEndpoint(safeFunctionName: string): Promise<FunctionEndpoint> {
    await this.read();
    const functionEndpoint: FunctionEndpoint = this.functions[safeFunctionName];
    return functionEndpoint;
  }

  async removeEndpoint(safeFunctionName: string): Promise<void> {
    await this.read();
    _unset(this, `functions.${safeFunctionName}`);
    await this.save();
  }

  async addPlugin(pluginName: string): Promise<void> {
    if (!this.plugins.includes(pluginName)) {
      this.plugins.push(pluginName);
      await this.save();
    }
  }

  async updateEndpoint(functionName: string, authorizerId: string, warmupEnabled: boolean) {
    await this.setAuthorizer(functionName, authorizerId);
    this.functions[functionName].warmup = {
      enabled: warmupEnabled,
    };
    await this.save();
  }
}

export default new JsonServerless();
