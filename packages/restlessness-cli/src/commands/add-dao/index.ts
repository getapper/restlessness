import chalk from 'chalk';
import { DaoPackage } from '@restlessness/core';

export default async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'));
    process.exit(1);
  } else if (argv._.length < 2) {
    console.log(chalk.red('Expected dao package name'));
    process.exit(1);
  } else {
      let daoPackage: DaoPackage;
    try {
      daoPackage = DaoPackage.load(argv._[1]);
    } catch {
      console.log(chalk.red('The specified Dao package does not exist'));
      process.exit(1);
    }
    await daoPackage.postInstall();
  }
  process.exit(0);
};

