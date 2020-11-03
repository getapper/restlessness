import JsonPlugins from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-plugin';

beforeAll(async (done) => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
  done();
});

describe('JsonPlugins model', () => {
  test('it should create an empty list',  async (done) => {
    await JsonPlugins.read();
    expect(JsonPlugins.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  done();
});
