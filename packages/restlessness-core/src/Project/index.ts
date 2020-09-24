import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import rimraf from 'rimraf';
import Misc from '../Misc';
import { generatePackageJson, generateGitIgnore, generateSharedResourcesServerlessJson } from './templates';
import { promisify } from 'util';
import PathResolver from '../PathResolver';

interface CreateOptions {
  installNodemodules?: boolean
};

export default class Project {
  static get defaultCreateOptions(): CreateOptions {
    return {
      installNodemodules: true,
    };
  }

  static async create(projectPath: string, options: CreateOptions) {
    const mergedOptions: CreateOptions = {};
    Object.assign(mergedOptions, Project.defaultCreateOptions, options);
    try {
      try {
        await fs.lstat(projectPath);
        throw new Error('Project path specified is not empty');
      } catch(e) {}

      process.env['RLN_PROJECT_PATH'] = projectPath;

      const name = path.normalize(projectPath).split(path.sep).pop();
      await Misc.copyFolderRecursive(path.join(__dirname, '..', '..', 'assets', 'boilerplate'), PathResolver.getPrjPath, true);
      await fs.writeFile(PathResolver.getPackageJsonPath, generatePackageJson(name));
      await fs.mkdir(PathResolver.getServicesJsonPath);
      await fs.writeFile(PathResolver.getSharedResourcesServerlessJsonPath, generateSharedResourcesServerlessJson(name));
      await fs.writeFile(path.join(projectPath, '.gitignore'), generateGitIgnore());
      if (mergedOptions.installNodemodules) {
        execSync('npm i', {
          cwd: projectPath,
          stdio: 'inherit',
        });
        execSync('npm i @restlessness/core@latest -S -E', {
          cwd: projectPath,
          stdio: 'inherit',
        });
        execSync('npm i yup -S -E', {
          cwd: projectPath,
          stdio: 'inherit',
        });
      }
    } catch (err) {
      console.log(err);
      try {
        await promisify(rimraf)(projectPath);
      } catch (e) {}
      throw err;
    }
  }

  static async build(): Promise<void> {
    execSync('npm run tsc', {
      cwd: PathResolver.getPrjPath,
      stdio: 'inherit',
    });
    await promisify(rimraf)(PathResolver.getDeployPath);
    await fs.mkdir(PathResolver.getDeployPath);
    await Misc.copyFolderRecursive(PathResolver.getDistPath, PathResolver.getDeployPath);
    await Misc.copyFolderRecursive(PathResolver.getConfigsPath, PathResolver.getDeployPath);
    await Misc.copyFolderRecursive(PathResolver.getEnvsPath, PathResolver.getDeployPath);
    // await Misc.copyFile(path.join(PathResolver.getServerlessJsonPath), PathResolver.getDeployPath); @TODO
    await Misc.copyFile(PathResolver.getPackageJsonPath, PathResolver.getDeployPath);
    execSync('npm i --production', {
      cwd: PathResolver.getDeployPath,
      stdio: 'inherit',
    });
  }
}

