import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import Authorizer from '.';

const PROJECT_NAME = 'tmp';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('Authorizer model', () => {
  test('it should create an empty list',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    const authorizers = await Authorizer.getList<Authorizer>();
    expect(authorizers?.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
