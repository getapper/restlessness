import JsonDaos from ".";
import * as TestUtils from "../TestUtils";

const PROJECT_NAME = "tmp-json-dao";

beforeAll(async () => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
});

describe("JsonDaos model", () => {
  test("it should create an empty list", async () => {
    await JsonDaos.read();
    expect(JsonDaos.entries.length).toBe(0);
  });
});

afterAll(async () => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
});
