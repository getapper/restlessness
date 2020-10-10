#!/usr/bin/env node

import minimist from 'minimist';
import chalk from 'chalk';
import newProject from './commands/new-project';
import dev from './commands/dev';
import createEnv from './commands/create-env';
import addDao from './commands/add-dao';
import addAuth from './commands/add-auth';
import deploy from './commands/deploy';
import remove from './commands/remove';

const cli = async () => {
  const majorVersion: number = parseInt((/^(\d+)(\.\d+){0,2}$/.exec(process.versions.node))[1], 10);
  if (majorVersion < 12) {
    throw new Error('Restlessness cli requires node version >= 12.x');
  }

  process.env['RLN_PROJECT_PATH'] = process.env['RLN_PROJECT_PATH'] || process.cwd();

  const argv = minimist(process.argv.slice(2));
  switch(argv._[0]) {
    case 'new':
      await newProject(argv);
      break;
    case 'dev':
      await dev(argv);
      break;
    case 'create-env':
      await createEnv(argv);
      break;
    case 'add-dao':
      await addDao(argv);
      break;
    case 'add-auth':
      await addAuth(argv);
      break;
    case 'deploy':
      await deploy(argv);
      break;
    case 'remove':
      await remove(argv);
      break;
    default:
      console.log(chalk.red('Wrong invocation of RLN'));
      break;
  }
};

cli().then().catch(e => {
  console.error(chalk.red(e));
  process.exit(1);
});
