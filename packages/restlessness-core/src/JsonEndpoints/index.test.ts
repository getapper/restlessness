import path from 'path';
import { promises as fs } from 'fs';
import JsonEndpoints, { JsonEndpointsEntry, HttpMethod } from '.';
import PathResolver from '../PathResolver';
import JsonServices from '../JsonServices';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-endpoints';

beforeAll(async (done) => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
  done();
});

describe('JsonEndpoints model', () => {
  test('it should create an empty list',  async (done) => {
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(0);
    done();
  });

  test('it should create a new endpoint',  async (done) => {
    await JsonEndpoints.create({ routePath: '/tests', method: HttpMethod.GET, serviceName: JsonServices.SHARED_SERVICE_NAME });
    await JsonEndpoints.read();
    const endpoints: JsonEndpointsEntry[] = JsonEndpoints.entries;
    expect(endpoints?.length).toBe(1);
    expect((await fs.lstat(path.join(PathResolver.getEndpointsPath, 'get-tests'))).isDirectory()).toBe(true);
    expect((await fs.lstat(path.join(PathResolver.getEndpointsPath, 'get-tests', 'index.ts'))).isFile()).toBe(true);
    const jsonEndpointEntry = await JsonEndpoints.getEntryById('getTests');
    expect(jsonEndpointEntry.id).toBe(jsonEndpointEntry.safeFunctionName);
    done();
  });

  test('it should create a new long endpoint',  async (done) => {
    await JsonEndpoints.create({
      routePath: '/really/long/api/with/a/lot/of/params/that/triggers/aws/checks/and/fails',
      method: HttpMethod.GET,
      serviceName: JsonServices.SHARED_SERVICE_NAME,
    });
    const jsonEndpointEntry = await JsonEndpoints.getEntryById('getReallyLongApiWithALotOfParamsThatTriggersAwsChecksAndFails');
    expect(jsonEndpointEntry.id).not.toBe(jsonEndpointEntry.safeFunctionName);
    done();
  });

  test('it should removed an endpoint',  async (done) => {
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(2);
    await JsonEndpoints.removeEntryById('getTests');
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(1);
    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  done();
});

