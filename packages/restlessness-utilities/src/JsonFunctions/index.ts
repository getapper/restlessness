import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoints';
import _unset from 'lodash.unset';

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

class JsonFunctions {
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
    functionName: string,
    functionPath: string,
    method: HttpMethod,
    authorizerId?: string,
  ) {
    await this.read();

    const functionEndpoint: FunctionEndpoint = {
      handler: `dist/exporter.${functionName}`,
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
    };
    if (authorizerId) {
      functionEndpoint.events[0].http.authorizer = authorizerId;
      if (!this.functions[authorizerId]) {
        this.functions[authorizerId] = {
          handler: `dist/authorizers/${authorizerId}.handler`,
        };
      }
    }
    this.functions[functionName] = functionEndpoint;
    await this.save();
  }

  async getEndpoint(functionName: string): Promise<FunctionEndpoint> {
    await this.read();
    const functionEndpoint: FunctionEndpoint = this.functions[functionName];
    return functionEndpoint;
  }

  async removeEndpoint(functionName: string): Promise<void> {
    await this.read();
    _unset(this, `functions.${functionName}`);
    await this.save();
  }
}

export default new JsonFunctions();