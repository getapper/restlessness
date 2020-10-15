import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import Project from '../Project';
import JsonSchedules from './';
import JsonServices from '../JsonServices';

const PROJECT_NAME = 'tmp-json-schedule-events';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  await Project.create(projectPath, {
    installNodemodules: false,
  });
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
      rate: 'rate(2 hours)',
    });
    expect(JsonSchedules.entries.length).toBe(1);

    await JsonSchedules.removeEntryById(schedulesEntry.id);
    expect(JsonSchedules.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

