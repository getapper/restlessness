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
}

class JsonServerless {
  service: string
  functions: Functions

  get jsonPath(): string {
    return PathResolver.getFunctionsConfigPath;
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
  ) {
    const functionEndpoint: FunctionEndpoint = {
      handler: `dist/exporter.${safeFunctionName}`,
      events: [
        {
          http: {
            path: functionPath,
            method: method,
            cors: true,
            authorizer: authorizerId || null,
          },
        },
      ],
    };
    await this.addFunction(safeFunctionName, functionEndpoint);
  }

  async addFunction(functionId: string, content: FunctionEndpoint) {
    await this.read();
    this.functions[functionId] = content;
    await this.save();
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
}

export default new JsonServerless();
