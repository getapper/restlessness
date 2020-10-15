import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '.';
import * as TestUtils from '../TestUtils';

const PROJECT_NAME = 'tmp-project';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

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

  /*
  test('Build project',  async (done) => {
    await Project.build();
    // expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    done();
  });
   */
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
