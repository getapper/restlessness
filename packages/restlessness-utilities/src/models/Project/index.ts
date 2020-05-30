import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { copyFolderRecursive } from '../../services/misc';

export class Project {
  static async create() {

  }
}

module.exports = async argv => {
  try {
    await copyFolderRecursive(path.join(__dirname, '..', '..', 'assets', 'boilerplate'), process.GLOBAL.PRJ_DIR, true);
    await fs.writeFile(path.join(process.GLOBAL.PRJ_DIR, 'serverless.yml'), generateServerlessYaml(name));
    await fs.writeFile(path.join(process.GLOBAL.PRJ_DIR, 'package.json'), generatePackageJson(name));
    await fs.writeFile(path.join(process.GLOBAL.PRJ_DIR, '.gitignore'), generateGitIgnore());
    execSync('npm i', {
      cwd: process.GLOBAL.PRJ_DIR,
      stdio: 'inherit',
    });
    execSync('npm i @restlessness/core@latest -S -E', {
      cwd: process.GLOBAL.PRJ_DIR,
      stdio: 'inherit',
    });
    execSync('npm i yup -S -E', {
      cwd: process.GLOBAL.PRJ_DIR,
      stdio: 'inherit',
    });
    console.log(chalk.green('DONE!'));
  } catch (err) {
    console.log(chalk.red(err));
  }
};

