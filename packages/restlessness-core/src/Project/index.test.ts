import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '.';

const PROJECT_NAME = 'tmp-project';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async () => {
  await promisify(rimraf)(projectPath);
});

describe('Project model', () => {
  test('Create project',  async () => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
  });

  /*
  test('Build project',  async () => {
    await Project.build();
    // expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
      });
   */
});

afterAll(async () => {
  await promisify(rimraf)(projectPath);
});
