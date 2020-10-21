import JsonAuthorizers from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-authorizer';

beforeAll(async (done) => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
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
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  done();
});
