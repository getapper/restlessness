import path from 'path';
import JsonAuthorizers from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-authorizer';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await TestUtils.createProject(projectPath);
  done();
});

describe('JsonAuthorizers model', () => {
  test('it should create an empty list',  async (done) => {
    await JsonAuthorizers.read();
    expect(JsonAuthorizers.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProject(projectPath);
  done();
});
