import JsonDaos from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-dao';

beforeAll(async (done) => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
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
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  done();
});
