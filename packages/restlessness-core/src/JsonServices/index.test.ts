import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import JsonServices from '../JsonServices';
import { HttpMethod } from '../JsonEndpoints';

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
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

