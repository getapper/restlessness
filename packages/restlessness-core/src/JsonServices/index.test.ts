import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import JsonServices from '../JsonServices';
import { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers, { JsonAuthorizersEntry } from '../JsonAuthorizers';
import { execSync } from 'child_process';

const PROJECT_NAME = 'tmp-json-services';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  await Project.create(projectPath, {
    installNodemodules: false,
  });
  expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
  done();
});

describe('JsonServices', () => {
  test('Add/Remove Endpoint',  async (done) => {
    await JsonServices.read();
    expect(JsonServices.offlineService).toBeDefined();
    expect(JsonServices.sharedService).toBeDefined();
    await JsonServices.addEndpoint({
      serviceName: JsonServices.OFFLINE_SERVICE_NAME,
      method: HttpMethod.GET,
      safeFunctionName: 'getTests',
      authorizerId: null,
      warmupEnabled: false,
      functionPath: '',
    });
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.offlineService.functions['getTests']).toBeDefined();
    await JsonServices.removeEndpoint(JsonServices.OFFLINE_SERVICE_NAME, 'getTests');
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.offlineService.functions['getTests']).toBeFalsy();
    done();
  });

  test('Add/Remove Service',  async (done) => {
    await JsonServices.read();
    await JsonServices.addService('testService');
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services['testService']).toBeDefined();
    await JsonServices.removeService('testService');
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services['testService']).toBeFalsy();
    done();
  });

  test('Add/Remove Plugin', async done => {
    const service1 = 'testService-1';
    const service2 = 'testService-2';
    const pluginName = 'serverless-plugin-test';
    await JsonServices.read();
    await JsonServices.addService(service1);
    await JsonServices.addService(service2);
    await JsonServices.addPlugin(service1, pluginName);
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services[service1].plugins.includes(pluginName)).toBe(true);
    expect(JsonServices.offlineService.plugins.includes(pluginName)).toBe(true);
    await JsonServices.addPlugin(service2, pluginName);
    await JsonServices.removePlugin(service1, pluginName);
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services[service1].plugins.includes(pluginName)).toBeFalsy();
    expect(JsonServices.services[service2].plugins.includes(pluginName)).toBe(true);
    expect(JsonServices.offlineService.plugins.includes(pluginName)).toBe(true);
    await JsonServices.removePlugin(service2, pluginName);
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services[service2].plugins.includes(pluginName)).toBeFalsy();
    expect(JsonServices.offlineService.plugins.includes(pluginName)).toBeFalsy();
    done();
  });

  test('Create Simple Authorizer', async done => {
    const authorizer = await createTestAuthorizer();
    const serviceName = 'auth-service-test';
    await JsonServices.addService(serviceName);
    await JsonServices.createAuthorizerFunction(serviceName, authorizer.id);
    await JsonServices.save();
    await JsonServices.read();
    expect(JsonServices.services[serviceName]?.functions[authorizer.id]).toBeDefined();
    expect(JsonServices.offlineService?.functions[authorizer.id]).toBeDefined();
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

async function createTestAuthorizer() {
  const authorizer: JsonAuthorizersEntry = {
    id: 'authorizer-test',
    name: 'auth-test',
    package: 'package-test',
    shared: false,
  };
  const packagePath = `${projectPath}/node_modules/${authorizer.package}`;
  execSync(`mkdir -p ${packagePath} && cd ${packagePath} && npm init -y`);
  await JsonAuthorizers.addEntry(authorizer);
  return authorizer;
}
