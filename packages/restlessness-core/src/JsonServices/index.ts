import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers from '../JsonAuthorizers';
import _unset from 'lodash.unset';
import path from 'path';
import { promisify } from 'util';
import lockfile from 'lockfile';
import { generateServiceServerlessJson } from '../Project/templates';
import PackageJson from '../PackageJson';

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

interface JsonServerless {
  service: string
  provider: {[key: string]: any}
  plugins: string[]
  functions: Functions
}

class JsonServices {
  services: { [key: string]: JsonServerless }

  get jsonPath(): string {
    return PathResolver.getServicesJsonPath;
  }

  async read(): Promise<void> {
    /*
    this.services save a representation of the various services as an object having:
    key: name of the service (without the ${projectName}- prefix, as in the json file
    value: content of the corresponding json file
    */

    const { name: projectName } = await PackageJson.read();
    const services: JsonServerless[] = await fs.readdir(this.jsonPath)
      .then(serviceFiles => serviceFiles.map(file => fs.readFile(path.join(this.jsonPath, file))))
      .then(files => Promise.all(files))
      .then(files => files.map(f => JSON.parse(f.toString())));

    this.services = services.reduce((acc, item) => {
      const serviceName = item.service.replace(`${projectName}-`, '');
      acc[serviceName] = item;
      return acc;
    }, {});

    //@TODO concurrency
    // await promisify<string, any>(lockfile.lock)(this.jsonPath + '.lock', { wait: 10 * 1000 });
    // const file = await fs.readFile(this.jsonPath);
    // Object.assign(this, JSON.parse(file.toString()));
    // await promisify(lockfile.unlock)(this.jsonPath + '.lock');
  }

  async save(): Promise<void> {
    for (let serviceName in this.services) {
      const serviceFilePath = path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`);
      const serviceFileContent = JSON.stringify(this.services[serviceName], null, 2);
      await fs.writeFile(serviceFilePath, serviceFileContent);
    }
    //@TODO concurrency
    // await promisify<string, any>(lockfile.lock)(this.jsonPath + '.lock', { wait: 10 * 1000 });
    // await fs.writeFile(this.jsonPath, JSON.stringify(this, null, 2));
    // await promisify(lockfile.unlock)(this.jsonPath + '.lock');
  }

  async addEndpoint(endpoint: {
    serviceName: string,
    safeFunctionName: string,
    functionPath: string,
    method: HttpMethod,
    authorizerId?: string,
    warmupEnabled?: boolean,
  }) {
    const {
      serviceName, safeFunctionName, functionPath,
      method, authorizerId, warmupEnabled,
    } = endpoint;

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
        enabled: warmupEnabled ?? true,
      },
    };

    //@TODO authorizer
    // if (authorizerId) {
    //   functionEndpoint.events[0].http.authorizer = authorizerId;
    //   if (!this.functions[authorizerId]) {
    //     await this.createAuthorizerFunction(authorizerId);
    //   }
    // }
    // this.functions[safeFunctionName] = functionEndpoint;
    if (!this.services[serviceName]?.functions) {
      throw Error(`Service ${serviceName} does not exists!`);
    }

    this.services[serviceName].functions[safeFunctionName] = functionEndpoint;
    await this.save();
  }

  async createService(serviceName: string) {
    await this.read();
    if (this.services[serviceName]?.functions) {
      throw Error(`Service ${serviceName} already exists!`);
    }

    const { name: projectName } = await PackageJson.read();
    await fs.writeFile(
      path.join(PathResolver.getServicesJsonPath),
      generateServiceServerlessJson(projectName, serviceName),
    );
    await this.read();
  }

  async createAuthorizerFunction(authorizerId: string) {
    // const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    // try {
    //   const entry = require(path.join(PathResolver.getNodeModulesPath, jsonAuthorizersEntry.package, 'package.json')).main.replace('.js', '');
    //   const absolutePath = path.join(PathResolver.getNodeModulesPath, jsonAuthorizersEntry.package, `${entry}.authorizer`);
    //   const handlerRelativePath = path.relative(PathResolver.getPrjPath, absolutePath);
    //   this.functions[authorizerId] = {
    //     handler: handlerRelativePath,
    //   };
    // } catch {
    //   throw new Error(`Cannot find authorizer ${jsonAuthorizersEntry?.package}!`);
    // }
  }

  async setAuthorizer(functionName: string, authorizerId: string) {
    // if (!authorizerId) {
    //   return;
    // }
    // if (!this.functions[authorizerId]) {
    //   await this.createAuthorizerFunction(authorizerId);
    // }
    // this.functions[functionName].events[0].http.authorizer = authorizerId;
  }

  async getEndpoint(serviceName:string, safeFunctionName: string): Promise<FunctionEndpoint> {
    await this.read();
    return this.services[serviceName]?.functions[safeFunctionName];
  }

  async removeEndpoint(safeFunctionName: string): Promise<void> {
    // await this.read();
    // _unset(this, `functions.${safeFunctionName}`);
    // await this.save();
  }

  async addPlugin(pluginName: string): Promise<void> {
    // if (!this.plugins.includes(pluginName)) {
    //   this.plugins.push(pluginName);
    //   await this.save();
    // }
  }

  async updateEndpoint(functionName: string, authorizerId: string, warmupEnabled: boolean) {
    // await this.setAuthorizer(functionName, authorizerId);
    // this.functions[functionName].warmup = {
    //   enabled: warmupEnabled,
    // };
    // await this.save();
  }
}

export default new JsonServices();
