import { Project } from '@restlessness/utilities';
import minimist from 'minimist';

const chalk = require('chalk')
const path = require('path')

export default async (argv: minimist.ParsedArgs) => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'))
  } else {
    let projectPath: string = process.cwd();
    if (argv._[1]) {
      projectPath = path.join(projectPath, argv._[1])
    }

    await Project.create(projectPath, {installNodemodules: true})
    console.log(chalk.green('Project created with success!'))
  }
}
