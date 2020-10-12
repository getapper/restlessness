import path from 'path';
import JsonServices from '../JsonServices';
import JsonEndpoints, { HttpMethod } from '../JsonEndpoints';
import JsonAuthorizers, { JsonAuthorizersEntry } from '../JsonAuthorizers';
import { execSync } from 'child_process';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-services';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await TestUtils.createProject(projectPath);
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

  test('Health Check', async done => {
    const service1 = 'test-health-service-1';
    const service2 = 'test-health-service-2';

    await JsonServices.read();
    await JsonServices.addService(service1);
    await JsonServices.addService(service2);
    expect(() => JsonServices.servicesHealthCheck()).toThrowError();
    await JsonServices.setApp('app-test');
    await JsonServices.setOrganization('org-test');
    await JsonServices.setRegion('us-east-1');
    expect(() => JsonServices.servicesHealthCheck()).not.toThrowError();
    await JsonServices.save();

    await JsonEndpoints.create({
      routePath: '/api-test-1',
      method: HttpMethod.GET,
      serviceName: service1,
    });
    await JsonEndpoints.create({
      routePath: '/api-test-2',
      method: HttpMethod.GET,
      serviceName: service2,
    });
    expect(() => JsonServices.servicesHealthCheck()).not.toThrowError();

    await JsonEndpoints.create({
      routePath: '/api-test-1',
      method: HttpMethod.POST,
      serviceName: service2,
    });
    expect(() => JsonServices.servicesHealthCheck()).toThrowError();

    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProject(projectPath);
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
