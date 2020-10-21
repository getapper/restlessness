import JsonSchedules, {RateUnit} from './';
import JsonServices from '../JsonServices';
import * as TestUtils from '../TestUtils';
import fsSync from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';

const PROJECT_NAME = 'tmp-json-schedule-events';

beforeAll(async (done) => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
  done();
});

describe('JsonSchedules', () => {
  test('Create/Remove schedule',  async (done) => {
    await JsonServices.read();
    await JsonServices.addService('service-test-1');

    await JsonSchedules.read();
    const schedulesEntry = await JsonSchedules.createSchedule({
      serviceName: 'service-test-1',
      name: 'cron-function-test',
      rateNumber: 2,
      rateUnit: RateUnit.HOURS,
    });
    expect(JsonSchedules.entries.length).toBe(1);
    expect(
      fsSync.existsSync(path.join(PathResolver.getSchedulesPath, schedulesEntry.id, 'index.ts')),
    ).toBe(true);
    expect(
      fsSync.existsSync(path.join(PathResolver.getSchedulesPath, schedulesEntry.id, 'handler.ts')),
    ).toBe(true);

    await JsonSchedules.removeEntryById(schedulesEntry.id);
    expect(JsonSchedules.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  done();
});

