import { promises as fs } from 'fs';
import JsonEnvs, { JsonEnvsEntry } from '.';
import PackageJson from '../PackageJson';
import PathResolver from '../PathResolver';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-json-env';

beforeAll(async () => {
  await TestUtils.createProjectInCwd(PROJECT_NAME);
  });

describe('JsonEnvs model', () => {
  test('it should create default envs',  async () => {
    await JsonEnvs.read();
    const envs: JsonEnvsEntry[] = JsonEnvs.entries;
    expect(envs?.length).toBe(4);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale')).toBe(true);
    expect(envIds.includes('test')).toBe(true);
    expect(envIds.includes('staging')).toBe(true);
    expect(envIds.includes('production')).toBe(true);
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(4);
      });

  test('it should create a new env',  async () => {
    await JsonEnvs.create('locale2');
    await JsonEnvs.read();
    const envs: JsonEnvsEntry[] = JsonEnvs.entries;
    expect(envs?.length).toBe(5);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale2')).toBe(true);
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(5);
    expect((await fs.readdir(PathResolver.getEnvsPath)).includes('.env.locale2')).toBe(true);
      });

  test('it should removed an env',  async () => {
    await JsonEnvs.read();
    let envs: JsonEnvsEntry[] = JsonEnvs.entries;
    expect(envs?.length).toBe(5);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale2')).toBe(true);
    await JsonEnvs.removeEntryById('locale2');
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(4);
    expect((await fs.readdir(PathResolver.getEnvsPath)).includes('.env.locale2')).toBe(false);
    const packageJson = await PackageJson.read();
    expect(packageJson?.scripts?.['DEV:locale2'] ?? null).toBe(null);
      });
});

afterAll(async () => {
  await TestUtils.deleteProjectFromCwd(PROJECT_NAME);
  });
