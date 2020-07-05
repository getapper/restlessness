import { Project } from '@restlessness/core';
import minimist from 'minimist';
import chalk from 'chalk';
import path from 'path';

export default async (argv: minimist.ParsedArgs) => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'));
  } else {
    let projectPath: string = process.cwd();
    if (argv._[1]) {
      projectPath = path.join(projectPath, argv._[1]);
    }

    await Project.create(projectPath, { installNodemodules: true });
    console.log(chalk.green('Project created with success!'));
  }
};
