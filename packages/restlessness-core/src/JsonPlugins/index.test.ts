import JsonPlugins from ".";
import * as TestUtils from "../TestUtils";

const PROJECT_NAME = "tmp-json-plugin";

beforeAll(async () => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
});

describe("JsonPlugins model", () => {
  test("it should create an empty list", async () => {
    await JsonPlugins.read();
    expect(JsonPlugins.entries.length).toBe(0);
  });
});

afterAll(async () => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
});
