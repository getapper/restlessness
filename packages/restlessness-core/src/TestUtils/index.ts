import { promisify } from 'util';
import { Project } from '../';
import rimraf from 'rimraf';

export async function createProject(projectPath: string) {
  await deleteProject(projectPath);
  await Project.create(projectPath, {
    installNodemodules: false,
  });
}

export async function deleteProject(projectPath: string) {
  await promisify(rimraf)(projectPath);
}
