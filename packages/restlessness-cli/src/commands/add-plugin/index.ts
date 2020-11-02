import chalk from 'chalk';
import { PluginPackage } from '@restlessness/core';

export default async argv => {
  if (argv._.length > 2) {
    console.log(chalk.red('Unexpected number of arguments'));
    process.exit(1);
  } else if (argv._.length < 2) {
    console.log(chalk.red('Expected plugin package name'));
    process.exit(1);
  } else {
    let pluginPackage: PluginPackage;
    try {
      pluginPackage = PluginPackage.load(argv._[1]);
    } catch {
      console.log(chalk.red('The specified Plugin package does not exist'));
      process.exit(1);
    }
    await pluginPackage.postInstall();
  }
  process.exit(0);
};

