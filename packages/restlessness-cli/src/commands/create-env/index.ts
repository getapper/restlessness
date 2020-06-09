import chalk from 'chalk';
import { EnvFile } from '@restlessness/utilities';

export default async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'));
    process.exit(1);
  } else if (argv._.length < 2) {
    console.log(chalk.red('Expected env name'));
    process.exit(1);
  } else {
    try {
      const env = new EnvFile(argv._[1]);
      await env.generate();
    } catch {
      console.log(chalk.red('The specified Environment does not exist'));
      process.exit(1);
    }
  }
  process.exit(0);
};

