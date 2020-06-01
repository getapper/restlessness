import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import JsonEnv from '.';
import PackageJson from '../PackageJson';
import PathResolver from '../PathResolver';

const PROJECT_NAME = 'tmp-json-env';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('JsonEnv model', () => {
  test('it should create default envs',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    const envs = await JsonEnv.getList<JsonEnv>();
    expect(envs?.length).toBe(4);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale')).toBe(true);
    expect(envIds.includes('test')).toBe(true);
    expect(envIds.includes('stage')).toBe(true);
    expect(envIds.includes('production')).toBe(true);
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(4);
    done();
  });

  test('it should create a new env',  async (done) => {
    await JsonEnv.create('locale2');
    const envs = await JsonEnv.getList<JsonEnv>();
    expect(envs?.length).toBe(5);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale2')).toBe(true);
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(5);
    expect((await fs.readdir(PathResolver.getEnvsPath)).includes('.env.locale2')).toBe(true);
    done();
  });

  test('it should removed an env',  async (done) => {
    let envs = await JsonEnv.getList<JsonEnv>();
    expect(envs?.length).toBe(5);
    const envIds = envs.map(env => env.id);
    expect(envIds.includes('locale2')).toBe(true);
    await JsonEnv.remove('locale2');
    expect((await fs.readdir(PathResolver.getEnvsPath)).length).toBe(4);
    expect((await fs.readdir(PathResolver.getEnvsPath)).includes('.env.locale2')).toBe(false);
    const packageJson = await PackageJson.read();
    expect(packageJson?.scripts?.['DEV:locale2'] ?? null).toBe(null);
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
