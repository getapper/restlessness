import path from 'path';
import JsonDaos from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-dao';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await TestUtils.createProject(projectPath);
  done();
});

describe('JsonDaos model', () => {
  test('it should create an empty list',  async (done) => {
    await JsonDaos.read();
    expect(JsonDaos.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProject(projectPath);
  done();
});
