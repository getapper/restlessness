 import minimist from 'minimist';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { JsonServices, PathResolver, EnvFile, JsonEnvs } from '@restlessness/core';

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
    .filter(s => s !== JsonServices.OFFLINE_SERVICE_NAME && s !== JsonServices.SHARED_SERVICE_NAME);
  servicesToDeploy = [JsonServices.SHARED_SERVICE_NAME, ...servicesToDeploy];

  if (argv._.length === 2) {
    const argService = argv._[1];
    if (!JsonServices.services[argService]) {
      throw `Service ${argService} does not exists!`;
    }
    servicesToDeploy = [argService];
  }

  JsonServices.servicesHealthCheck();

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

  try {
    const env = new EnvFile(jsonEnv.id);
    await env.generate();
  } catch {
    throw `Cannot generate .env file for environment ${jsonEnv.id}`;
  }

  const outputPath = path.join(PathResolver.getPrjPath, '.serverless-outputs');
  try {
    await fs.rmdir(outputPath, { recursive: true });
  } catch (ex) {}

  for (let serviceName of servicesToDeploy) {
    const packagePath = path.relative(process.cwd(), path.join(outputPath, serviceName));
    await fs.mkdir(packagePath, { recursive: true });
    const servicePath = path.relative(process.cwd(), path.join(PathResolver.getServicesJsonPath, `${serviceName}.json`));

    console.log(chalk.blue('Restlessness:'), 'Packaging service', serviceName);
    const packageArgs = ['--config', servicePath, 'package', '--package', packagePath, '--stage', jsonEnv.stage, '--verbose'];
    await spawnAsyncWithInheritStdio('serverless', packageArgs);

    console.log(chalk.blue('Restlessness:'), 'Deploying service', serviceName);
    const deployArgs = ['--config', servicePath, 'deploy', '--package', packagePath, '--stage', jsonEnv.stage, '--verbose'];
    await spawnAsyncWithInheritStdio('serverless', deployArgs);
  }
};
