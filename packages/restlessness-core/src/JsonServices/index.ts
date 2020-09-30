import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers from '../JsonAuthorizers';
import _unset from 'lodash.unset';
import _merge from 'lodash.merge';
import path from 'path';
import { generateServiceServerlessJson } from './templates';
import PackageJson from '../PackageJson';

interface Functions {
  [key: string]: FunctionEndpoint
}

interface Event {
  http: {
    path: string,
    method: HttpMethod,
    cors: boolean,
    authorizer?: string | {[key: string]: any}
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
  resources: {[key: string]: any}
  plugins: string[]
  functions: Functions
}

class JsonServices {
  services: { [key: string]: JsonServerless }

  get OFFLINE_SERVICE_NAME() {
    return 'offline';
  }

  get SHARED_SERVICE_NAME() {
    return 'shared-resources';
  }

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
  }

  async save(): Promise<void> {
    for (let serviceName in this.services) {
      const serviceFilePath = path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`);
      const serviceFileContent = JSON.stringify(this.services[serviceName], null, 2);
      await fs.writeFile(serviceFilePath, serviceFileContent);
    }
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

    if (!this.services[serviceName]) {
      throw Error(`Service ${serviceName} does not exists!`);
    }

    this.services[serviceName].functions[safeFunctionName] = {
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

    if (authorizerId) {
      await this.setAuthorizerToFunction(serviceName, safeFunctionName, authorizerId);
    }

    await this.save();
  }

  async getEndpoint(serviceName:string, safeFunctionName: string): Promise<FunctionEndpoint> {
    await this.read();
    return this.services[serviceName]?.functions[safeFunctionName];
  }

  async updateEndpoint(serviceName: string, functionName: string, authorizerId: string, warmupEnabled: boolean) {
    if (!this[serviceName]?.functions[functionName]) {
      throw Error(`${functionName} does not exists in service '${serviceName}'`);
    }
    // await this.setAuthorizer(functionName, authorizerId); @TODO
    this.services[serviceName].functions[functionName].warmup = {
      enabled: warmupEnabled,
    };
    await this.save();
  }

  async removeEndpoint(serviceName: string, safeFunctionName: string): Promise<void> {
    await this.read();
    _unset(this.services[serviceName], `functions.${safeFunctionName}`);
    await this.save();
  }

  async addService(serviceName: string) {
    await this.read();
    if (this.services[serviceName]) {
      throw Error(`Service ${serviceName} already exists!`);
    }
    const { name: projectName } = await PackageJson.read();
    this.services[serviceName] = JSON.parse(generateServiceServerlessJson(projectName, serviceName));
    await this.save();
  }

  async removeService(serviceName: string) {
    await this.read();
    _unset(this.services, serviceName);
    await this.save();
  }

  async createAuthorizerFunction(serviceName: string, authorizerId: string) {
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    if (!jsonAuthorizersEntry) {
      throw new Error(`Cannot find authorizer ${jsonAuthorizersEntry?.package}!`);
    }
    if (!this.services[serviceName]) {
      throw new Error(`Service ${serviceName} does not exist!`);
    }

    const authorizerPath = path.join(PathResolver.getNodeModulesPath, jsonAuthorizersEntry.package);
    const packageJsonPath = path.join(authorizerPath, 'package.json');
    let entry = require(packageJsonPath).main || 'index.js';
    entry = entry.replace('.js', '');

    const absolutePath = path.join(authorizerPath, `${entry}.authorizer`);
    const handlerRelativePath = path.relative(PathResolver.getPrjPath, absolutePath);

    const serviceUpdate = {
      functions: {},
    };
    serviceUpdate.functions[authorizerId] = {
      handler: handlerRelativePath,
    };
    _merge(this.services[serviceName], serviceUpdate);
    await this.save();
  }

  async createCustomAuthorizerForSharedService(
    authorizerId: string,
    identitySource = 'method.request.header.Auth',
  ) {
    await this.createAuthorizerFunction(this.SHARED_SERVICE_NAME, authorizerId);

    const slsName = authorizerId[0].toUpperCase() + authorizerId.slice(1);
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);

    const authResource = {
      'Type': 'AWS::ApiGateway::Authorizer',
      'Properties': {
        'Name': slsName,
        'AuthorizerUri': {
          'Fn::Join': [
            '',
            [
              'arn:aws:apigateway:',
              {
                'Ref': 'AWS::Region',
              },
              ':lambda:path/2015-03-31/functions/',
              {
                'Fn::GetAtt': [`${slsName}LambdaFunction`, 'Arn'],
              },
              '/invocations',
            ],
          ],
        },
        'Type': 'TOKEN',
        'IdentitySource': identitySource,
        'RestApiId': {
          'Ref': 'SharedGW',
        },
      },
    };

    const authOutput = {
      'Value': {
        'Fn::GetAtt': [`${slsName}LambdaFunction`, 'Arn'],
      },
      'Export': {
        'Name': jsonAuthorizersEntry.importKey,
      },
    };

    const serviceUpdate = {
      resources: { Resources: {}, Outputs: {} },
    };
    serviceUpdate.resources.Resources[slsName] = authResource;
    serviceUpdate.resources.Outputs[slsName] = authOutput;

    this.services[this.SHARED_SERVICE_NAME] = _merge(
      this.services[this.SHARED_SERVICE_NAME],
      serviceUpdate,
    );

    await this.save();
  }

  async setAuthorizerToFunction(serviceName: string, functionName: string, authorizerId: string) {
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    if (!jsonAuthorizersEntry) {
      throw new Error(`Cannot find authorizer ${jsonAuthorizersEntry?.package}!`);
    }
    if (!this.services[serviceName]) {
      throw new Error(`Service ${serviceName} does not exist!`);
    }

    if (jsonAuthorizersEntry.shared) {
      this.services[serviceName].functions[functionName].events[0].http.authorizer = {
        name: authorizerId,
        arn: { 'Fn::ImportValue': jsonAuthorizersEntry.importKey },
      };
    } else {
      //@TODO set authorizer to single service (not shared)
    }

    await this.save();
  }

  async addPlugin(serviceName:string, pluginName: string): Promise<void> {
    // if (!this.plugins.includes(pluginName)) {
    //   this.plugins.push(pluginName);
    //   await this.save();
    // }
  }
}

export default new JsonServices();
