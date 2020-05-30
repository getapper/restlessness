import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '.';

const PROJECT_NAME = 'tmp';

const projectPath = path.join(process.cwd(), PROJECT_NAME);

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('Project model', () => {
  test('Create project',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
