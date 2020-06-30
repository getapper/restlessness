import chalk from 'chalk';
import { AuthorizerPackage } from '@restlessness/utilities';

export default async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'));
    process.exit(1);
  } else if (argv._.length < 2) {
    console.log(chalk.red('Expected auth package name'));
    process.exit(1);
  } else {
    try {
      const authorizerPackage: AuthorizerPackage = AuthorizerPackage.load(argv._[1]);
      await authorizerPackage.postInstall();
    } catch (e) {
      console.log(chalk.red('Error adding auth package'), e);
      process.exit(1);
    }
  }
  process.exit(0);
};

