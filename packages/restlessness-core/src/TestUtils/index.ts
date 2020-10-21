import { promisify } from 'util';
import { Project } from '../';
import rimraf from 'rimraf';
import path from 'path';

export async function createProjectInCwd(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName);
  await deleteProjectFromCwd(projectPath);
  process.env['RLN_PROJECT_PATH'] = projectPath;
  await Project.create(projectPath, {
    installNodemodules: false,
  });
}

export async function deleteProjectFromCwd(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName);
  await promisify(rimraf)(projectPath);
}
