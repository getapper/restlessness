import path from "path";
import { promises as fs } from "fs";
import JsonEndpoints, { JsonEndpointsEntry, HttpMethod } from ".";
import PathResolver from "../PathResolver";
import JsonServices from "../JsonServices";
import * as TestUtils from "../TestUtils";

const PROJECT_NAME = "tmp-json-endpoints";

beforeAll(async () => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
});

describe("JsonEndpoints model", () => {
  test("it should create an empty list", async () => {
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(0);
  });

  test("it should create a new endpoint", async () => {
    await JsonEndpoints.create({
      routePath: "/tests",
      method: HttpMethod.GET,
      serviceName: JsonServices.SHARED_SERVICE_NAME,
    });
    await JsonEndpoints.read();
    const endpoints: JsonEndpointsEntry[] = JsonEndpoints.entries;
    expect(endpoints?.length).toBe(1);
    expect(
      (
        await fs.lstat(path.join(PathResolver.getEndpointsPath, "get-tests"))
      ).isDirectory(),
    ).toBe(true);
    expect(
      (
        await fs.lstat(
          path.join(PathResolver.getEndpointsPath, "get-tests", "index.ts"),
        )
      ).isFile(),
    ).toBe(true);
    const jsonEndpointEntry = await JsonEndpoints.getEntryById("getTests");
    expect(jsonEndpointEntry.id).toBe(jsonEndpointEntry.safeFunctionName);
  });

  test("it should create a new long endpoint", async () => {
    await JsonEndpoints.create({
      routePath:
        "/really/long/api/with/a/lot/of/params/that/triggers/aws/checks/and/fails",
      method: HttpMethod.GET,
      serviceName: JsonServices.SHARED_SERVICE_NAME,
    });
    const jsonEndpointEntry = await JsonEndpoints.getEntryById(
      "getReallyLongApiWithALotOfParamsThatTriggersAwsChecksAndFails",
    );
    expect(jsonEndpointEntry.id).not.toBe(jsonEndpointEntry.safeFunctionName);
  });

  test("it should removed an endpoint", async () => {
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(2);
    await JsonEndpoints.removeEntryById("getTests");
    await JsonEndpoints.read();
    expect(JsonEndpoints.entries.length).toBe(1);
  });
});

afterAll(async () => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
});
