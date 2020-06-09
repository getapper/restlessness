import minimist from 'minimist';
import chalk from 'chalk';
import newProject from './commands/newProject';
import dev from './commands/dev';

const cli = async () => {
  const argv = minimist(process.argv.slice(2));
  switch(argv._[0]) {
    case 'new':
      await newProject(argv);
      break;
    case 'dev':
      await dev(argv);
      break;
    default:
      console.log(chalk.red('Wrong invocation of RLN'));
      break;
  }
};

cli().then(() => process.exit(0)).catch(e => {
  console.error(chalk.red(e));
  process.exit(1);
});
