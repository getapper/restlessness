import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoint';

interface Functions {
  [key: string]: any
}

export default class JsonFunction {
  functions: Functions

  static get jsonPath(): string {
    return PathResolver.getFunctionsConfigPath;
  }

  static async read(): Promise<JsonFunction> {
    const file = await fs.readFile(this.jsonPath);
    return JSON.parse(file.toString());
  }

  static async save(jsonFunction: JsonFunction): Promise<void> {
    await fs.writeFile(this.jsonPath, JSON.stringify(jsonFunction, null, 2));
  }

  static async addEndpoint(
    functionName: string,
    functionPath: string,
    method: HttpMethod,
    authorizerId?: string,
  ) {
    const jsonFunction = await JsonFunction.read();

    const endpointFunction = {
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
      endpointFunction.events[0].http.authorizer = authorizerId;
      if (!jsonFunction.functions[authorizerId]) {
        jsonFunction.functions[authorizerId] = {
          handler: `dist/authorizers/${authorizerId}.handler`,
        };
      }
    }
    jsonFunction.functions[functionName] = endpointFunction;
    await JsonFunction.save(jsonFunction);
  }
}
