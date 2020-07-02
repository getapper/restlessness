import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import JsonEndpoints, { JsonEndpointsEntry, HttpMethod } from '.';
import PathResolver from '../PathResolver';
import PackageJson from '../PackageJson';

const PROJECT_NAME = 'tmp-json-endpoints';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('JsonEndpoints model', () => {
  test('it should create an empty list',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(0);
    done();
  });

  test('it should create a new endpoint',  async (done) => {
    await JsonEndpoints.create('/tests', HttpMethod.GET);
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
    await JsonEndpoints.create('/really/long/api/with/a/lot/of/params/that/triggers/aws/checks/and/fails', HttpMethod.GET);
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
  await promisify(rimraf)(projectPath);
  done();
});

