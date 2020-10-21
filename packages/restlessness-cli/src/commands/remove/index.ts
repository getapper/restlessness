 import minimist from 'minimist';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { JsonServices, PathResolver, JsonEnvs } from '@restlessness/core';

function spawnAsyncWithInheritStdio(command: string, args: any[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('error', reject);
    proc.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

export default async (argv: minimist.ParsedArgs) => {
  if (argv._.length > 2) {
    throw 'Unexpected number of arguments';
  }

  await JsonServices.read();
  let servicesToDeploy = Object.keys(JsonServices.services)
    .filter(s => s !== JsonServices.OFFLINE_SERVICE_NAME)
    .filter(s => s !== JsonServices.SHARED_SERVICE_NAME);
  servicesToDeploy = [...servicesToDeploy, JsonServices.SHARED_SERVICE_NAME];

  if (argv._.length === 2) {
    const argService = argv._[1];
    if (!JsonServices.services[argService]) {
      throw `Service ${argService} does not exists!`;
    }
    servicesToDeploy = [argService];
  }

  let deploymentEnv = 'staging';
  if (argv.env) {
    deploymentEnv = argv.env;
  }

  const jsonEnv = await JsonEnvs.getEntryById(deploymentEnv);
  if (!jsonEnv) {
    throw `Cannot find Environment ${deploymentEnv}`;
  }
  if (!jsonEnv.stage) {
    throw `Cannot deploy! Environment ${jsonEnv.id} does not have an associated stage`;
  }

  const outputPath = path.join(PathResolver.getPrjPath, '.serverless-outputs');
  try {
    await fs.rmdir(outputPath, { recursive: true });
  } catch (e) {}

  for (let serviceName of servicesToDeploy) {
    const servicePath = path.relative(process.cwd(), path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`));

    console.log(chalk.blue('Restlessness:'), 'Removing service', serviceName);
    const deployArgs = ['--config', servicePath, 'remove', '--stage', jsonEnv.stage, '--verbose'];
    try {
      await spawnAsyncWithInheritStdio('serverless', deployArgs);
    } catch (e) {
      console.log(chalk.red('Restlessness error'), 'Removing service', serviceName);
    }
  }
};
