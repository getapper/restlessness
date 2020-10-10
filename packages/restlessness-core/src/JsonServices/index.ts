import { promises as fs } from 'fs';
import PathResolver from '../PathResolver';
import { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers from '../JsonAuthorizers';
import _unset from 'lodash.unset';
import _merge from 'lodash.merge';
import path from 'path';
import { generateServiceServerlessJson } from './templates';
import PackageJson from '../PackageJson';
import { FunctionEndpoint, JsonServerless } from './interfaces';
export * from './interfaces';

class JsonServices {
  services: { [key: string]: JsonServerless }

  get OFFLINE_SERVICE_NAME() {
    return 'offline';
  }

  get SHARED_SERVICE_NAME() {
    return 'shared-resources';
  }

  get offlineService() {
    return this.services[this.OFFLINE_SERVICE_NAME];
  }

  get sharedService() {
    return this.services[this.SHARED_SERVICE_NAME];
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
    this.setFunctionToService(serviceName, safeFunctionName, functionEndpoint);

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
    if (!this.services[serviceName]?.functions[functionName]) {
      throw Error(`${functionName} does not exists in service '${serviceName}'`);
    }
    if (authorizerId) {
      await this.setAuthorizerToFunction(serviceName, functionName, authorizerId);
    }
    this.services[serviceName].functions[functionName].warmup = {
      enabled: warmupEnabled,
    };
    this.offlineService.functions[functionName].warmup = {
      enabled: warmupEnabled,
    };
    await this.save();
  }

  async removeEndpoint(serviceName: string, safeFunctionName: string): Promise<void> {
    await this.read();
    _unset(this.services[serviceName], `functions.${safeFunctionName}`);
    _unset(this.offlineService, `functions.${safeFunctionName}`);
    await this.save();
  }

  async renameService(serviceName: string, newServiceName) {
    this.services[newServiceName] = {
      ...this.services[serviceName],
      service: this.services[serviceName].service.replace(serviceName, newServiceName),
    };
    _unset(this.services, serviceName);
    await fs.unlink(path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`));
    await this.save();
  }

  async changeEndpointService(serviceName: string, newServiceName: string, functionName: string) {
    const functionUpdate = {};
    functionUpdate[functionName] = this.services[serviceName].functions[functionName];
    _merge(this.services[newServiceName].functions, functionUpdate);
    _unset(this.services[serviceName].functions, functionName);
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
    await fs.unlink(path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`));
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
    _merge(this.offlineService, serviceUpdate);
  }

  async createCustomAuthorizerForSharedService(
    authorizerId: string,
    identitySource = 'method.request.header.Authorization',
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

    const authPermissionResource = {
      'Type': 'AWS::Lambda::Permission',
      'Properties': {
        'Action': 'lambda:InvokeFunction',
        'FunctionName': {
          'Fn::GetAtt': [
            `${slsName}LambdaFunction`,
            'Arn',
          ],
        },
        'Principal': 'apigateway.amazonaws.com',
      },
    };

    const authOutput = {
      'Value': {
        'Ref': slsName,
      },
      'Export': {
        'Name': jsonAuthorizersEntry.importKey,
      },
    };

    const serviceUpdate = {
      resources: { Resources: {}, Outputs: {} },
    };
    serviceUpdate.resources.Resources[slsName] = authResource;
    serviceUpdate.resources.Resources[`${slsName}Permission`] = authPermissionResource;
    serviceUpdate.resources.Outputs[slsName] = authOutput;

    _merge(this.sharedService, serviceUpdate);
  }

  private setFunctionToService(serviceName: string, functionName: string, functionEndpoint: FunctionEndpoint) {
    if (!this.services[serviceName]) {
      throw Error(`Service ${serviceName} does not exists!`);
    }
    const functionUpdate = {};
    functionUpdate[functionName] = functionEndpoint;
    _merge(this.services[serviceName].functions, functionUpdate);
    _merge(this.offlineService.functions, functionUpdate);
  }

  private async setAuthorizerToFunction(serviceName: string, functionName: string, authorizerId: string) {
    const jsonAuthorizersEntry = await JsonAuthorizers.getEntryById(authorizerId);
    if (!jsonAuthorizersEntry) {
      throw new Error(`Cannot find authorizer ${jsonAuthorizersEntry?.package}!`);
    }
    if (!this.services[serviceName]?.functions[functionName]) {
      throw new Error(`Function ${functionName} does not exist on service ${serviceName}!`);
    }

    if (jsonAuthorizersEntry.shared) {
      this.services[serviceName].functions[functionName].events[0].http.authorizer = {
        type: 'CUSTOM',
        authorizerId: {
          'Fn::ImportValue': jsonAuthorizersEntry.importKey,
        },
      };
    } else {
      if (!this.services[serviceName].functions[authorizerId]) {
        await this.createAuthorizerFunction(serviceName, authorizerId);
      }
      this.services[serviceName].functions[functionName].events[0].http.authorizer = authorizerId;
    }

    if (!this.offlineService.functions[authorizerId]) {
      await this.createAuthorizerFunction(this.OFFLINE_SERVICE_NAME, authorizerId);
    }
    this.offlineService.functions[functionName].events[0].http.authorizer = authorizerId;
  }

  async addPlugin(serviceName:string, pluginName: string): Promise<void> {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} does not exists!`);
    }
    if (!service.plugins) {
      service.plugins = [];
    }
    if (!service.plugins.includes(pluginName)) {
      service.plugins.push(pluginName);
    }
    if (!this.offlineService.plugins.includes(pluginName)) {
      this.offlineService.plugins.push(pluginName);
    }
  }

  async removePlugin(serviceName: string, pluginName: string) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} does not exists!`);
    }
    const pluginIdx = service.plugins.indexOf(pluginName);
    if (pluginIdx !== -1) {
      service.plugins.splice(pluginIdx, 1);
    }

    const servicesIncludingPlugin = Object.keys(this.services)
      .filter(s => s !== this.OFFLINE_SERVICE_NAME)
      .filter(s => this.services[s].plugins?.includes(pluginName));

    const offlinePluginIdx = this.offlineService.plugins.indexOf(pluginName);
    if (offlinePluginIdx !== -1 && servicesIncludingPlugin.length === 0) {
      this.offlineService.plugins.splice(offlinePluginIdx, 1);
    }
  }
}

export default new JsonServices();
