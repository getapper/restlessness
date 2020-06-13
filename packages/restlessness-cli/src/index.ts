#!/usr/bin/env node

import minimist from 'minimist';
import chalk from 'chalk';
import newProject from './commands/new-project';
import dev from './commands/dev';
import createEnv from './commands/create-env';

const cli = async () => {
  const majorVersion: number = parseInt((/^(\d+)(\.\d+){0,2}$/.exec(process.versions.node))[1], 10);
  if (majorVersion < 12) {
    throw new Error('Run command requires node version >= 12.x');
  }

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
    default:
      console.log(chalk.red('Wrong invocation of RLN'));
      break;
  }
};

cli().then().catch(e => {
  console.error(chalk.red(e));
  process.exit(1);
});
