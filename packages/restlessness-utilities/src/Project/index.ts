import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import rimraf from 'rimraf';
import Misc from 'root/Misc';
import { generateServerlessYaml, generatePackageJson, generateGitIgnore } from './templates';
import { promisify } from 'util';

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
      await Misc.copyFolderRecursive(path.join(__dirname, '..', '..', 'assets', 'boilerplate'), projectPath, true);
      await fs.writeFile(path.join(projectPath, 'serverless.yml'), generateServerlessYaml(name));
      await fs.writeFile(path.join(projectPath, 'package.json'), generatePackageJson(name));
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
      try {
        await promisify(rimraf)(projectPath);
      } catch (e) {}
      throw err;
    }
  }
}

