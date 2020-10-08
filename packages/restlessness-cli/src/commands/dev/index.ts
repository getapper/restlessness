import minimist from 'minimist';
import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import chalk from 'chalk';
import { which } from 'shelljs';
import { EnvFile, ENV } from '@restlessness/core';

const printRestlessnessData = (d, newlineAtStart = false) => {
  const data = d.toString();
  const nl = data.endsWith('\n') ? '' : '\n';
  const nlStart = newlineAtStart ? '\n' : '';
  process.stdout.write(`${nlStart}${chalk.blue('RESTLESSNESS')}: ${data}${nl}`);
};
const printRestlessnessError = e => {
  process.stderr.write(chalk.red(`RESTLESSNESS error:\n${e.toString()}`));
};

function getProjectName() {
  try {
    return require(path.join(process.cwd(), 'package.json')).name;
  } catch {
    throw 'Cannot find package.json. Are you on the root folder?';
  }
}

function checkPeerDependencies() {
  const deps = ['serve', 'serverless'];
  for (const dep of deps) {
    if (!which(dep)) {
      throw `Cannot find ${dep}. Maybe you forgot to install it with: npm i ${dep} -g`;
    }
  }
}

/*
spawnBackend, spawnFrontend, spawnProject functions spawns the homonym processes.
The ChildProcess object is returned through a promise, with some callbacks already defined:
- stdout/err data event: check the output and resolve the promise if the server starts successfully
- exit event: reject the promise if the process exit with an error code. This event can then be overridden
- error event: reject the promise if the process cannot be spawned
*/

function spawnBackend(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('serverless', ['offline', '--config', 'serverless-services/offline.json', '--port', '4123'], {
      cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'backend'),
      env: {
        ...process.env,
        RLN_PROJECT_PATH: process.cwd(),
      },
      /*
      First 3 value corresponds to stdin/stdout/stderr.
      'pipe' value creates a pipe between the child process and the parent process.
      The parent can then access the pipe through a property on the child_process object (subprocess.stdio[fd]).
      Pipes created for fds 0, 1, and 2 are also available as subprocess.stdin, subprocess.stdout and
      subprocess.stderr, respectively.
      'ipc' value creates an Inter Process Communication channel for passing messages between parent and child.
      Setting this option enable the send() method (process.send() for the child, child_process.send()
      for the parent) as well as the 'message' event.
      see https://nodejs.org/api/child_process.html#child_process_options_stdio for a detailed description.
      */
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      shell: true,
    });
    proc.stdout.on('data', d => {
      const data = d.toString();
      if (data.indexOf('Serverless: Offline [HTTP] listening on') !== -1) {
        resolve(proc);
      }

      const trimmed = data.trim();
      if (trimmed && !trimmed.startsWith('Serverless:')) {
        printRestlessnessData(data);
      }
    });
    proc.stderr.on('data', printRestlessnessError);
    proc.on('error', reject);
    proc.on('exit', code => {
      reject(`Restlessness backend process exited with status code ${code}`);
    });
  });
}

function spawnFrontend(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('serve', [], {
      cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'frontend', 'build'),
      shell: true,
    });
    proc.stdout.on('data', d => {
      if (d.toString().indexOf('Accepting connections at') !== -1) {
        resolve(proc);
      }
    });
    proc.stderr.on('data', printRestlessnessError);
    proc.on('error', reject);
    proc.on('exit', code => {
      reject(`Restlessness frontend process exited with status code ${code}`);
    });
  });
}

function spawnProject(name: string, env: ENV): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    // @TODO: 'serverless-services/offline.json' should be changed with `${PathResolver.getOfflineServerlessJsonPath}.json`
    const proc = spawn('serverless', ['--config', 'serverless-services/offline.json', 'offline', '--port', '4000'], {
      env: {
        ...process.env,
        ...env,
        RLN_ENVIRONMENT_LOADED: 'true',
      },
      shell: true,
    });
    proc.stdout.on('data', d => {
      if (d.toString().indexOf('Serverless: Offline [HTTP] listening on') !== -1) {
        resolve(proc);
      }
      process.stdout.write(`${chalk.green(name)}: ${d.toString()}`);
    });
    proc.stderr.on('data', d => {
      process.stderr.write(chalk.red(`${name}: ${d.toString()}`));
    });
    proc.on('error', reject);
    proc.on('exit', code => {
      reject(`${name} process exited with status code ${code}`);
    });
  });
}

export default async (argv: minimist.ParsedArgs) => {
  if (argv._.length > 2) {
    throw 'Unexpected number of arguments';
  } else if (argv._.length < 2) {
    throw 'Expected env name';
  }

  checkPeerDependencies();
  const projectName = getProjectName();
  const envFile = new EnvFile(argv._[1]);
  const projectEnv = await envFile.expand();

  let projectProc;
  let frontendProc;
  let backendProc;

  const terminateChildren = () => {
    projectProc?.kill();
    frontendProc?.kill();
    backendProc?.kill();
  };

  /*
  If any of the processes exit prematurely with an error code all other
  processes are killed, since the 3 processes are dependents
  */
  const terminateOnExit = returnCode => {
    if (returnCode !== 0) {
      terminateChildren();
    }
  };
  process.on('SIGINT', () => {
    printRestlessnessData('Shutting down...', true);
    terminateChildren();
  });

  try {
    backendProc = await spawnBackend();
    backendProc.on('message', async message => {
      if (message === 'RESTART_PROJECT') {
        projectProc?.kill();
        printRestlessnessData(`Restarting project ${projectName}...`);
        projectProc = await spawnProject(projectName, projectEnv);
      }
    });
    backendProc.on('exit', terminateOnExit);
  } catch (e) {
    terminateChildren();
    throw e;
  }

  try {
    frontendProc = await spawnFrontend();
    frontendProc.on('exit', terminateOnExit);
    printRestlessnessData('Running on http://localhost:5000\n');
  } catch (e) {
    terminateChildren();
    throw e;
  }

  try {
    projectProc = await spawnProject(projectName, projectEnv);
    projectProc.on('exit', terminateOnExit);
  } catch (e) {
    terminateChildren();
    throw e;
  }
};
