import JsonAuthorizers from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-authorizer';

beforeAll(async () => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
  });

describe('JsonAuthorizers model', () => {
  test('it should create an empty list',  async () => {
    await JsonAuthorizers.read();
    expect(JsonAuthorizers.entries.length).toBe(0);
  });
});

afterAll(async () => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
});

