#!/usr/bin/env node

import minimist from 'minimist';
import chalk from 'chalk';
import newProject from './commands/newProject';
import dev from './commands/dev';
import createEnv from './commands/create-env';

const cli = async () => {
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
