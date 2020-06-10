import minimist from 'minimist';
import path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';

const printProcessData = (procName, color, data) => {
  process.stdout.write(`${color(procName)}: ${data.toString()}`);
};
const printProcessError = (procName, err) => {
  process.stderr.write(`${chalk.red(procName)}: ${err.toString()}`);
};

function spawnProject(name) {
  const proc = spawn('serverless', ['offline', '--port', '4000'], {
    shell: true,
  });
  proc.stdout.on('data', d => {
    printProcessData(name, chalk.green, d);
  });
  proc.stderr.on('data', e => {
    printProcessError(name, e);
  });
  proc.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });
  proc.on('error', console.error);
  return proc;
}

export default async (argv: minimist.ParsedArgs) => {
  const majorVersion: number = parseInt((/^(\d+)(\.\d+){0,2}$/.exec(process.versions.node))[1], 10);
  if (majorVersion < 12) {
    throw new Error('Run command requires node version >= 12.x');
  }

  let projectName;
  let projectProc;
  try {
    projectName = require(path.join(process.cwd(), 'package.json')).name;
  } catch {
    console.log(chalk.red('Cannot find package.json. Are you on the root folder?'));
    process.exit(1);
  }

  const backend = spawn('serverless', ['offline', '--port', '4123'], {
    cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'backend'),
    env: {
      ...process.env,
      RLN_PROJECT_PATH: process.cwd(),
    },
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    shell: true,
  });
  backend.stdout.on('data', d => {
    printProcessData('rln-backend', chalk.yellow, d);
  });
  backend.stderr.on('data', e => {
    printProcessError('rln-backend', e);
  });
  backend.on('error', console.error);
  backend.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    process.exit(1);
  });
  backend.on('message', message => {
    if (message === 'RESTART_PROJECT') {
      if (projectProc) {
        projectProc.kill();
      }
      console.log('Restarting severless...');
      projectProc = spawnProject(projectName);
    }
  });

  const frontend = spawn('serve', [], {
    cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'frontend', 'build'),
    shell: true,
  });
  frontend.stdout.on('data', d => {
    printProcessData('rln-frontend', chalk.blue, d);
  });
  frontend.stderr.on('data', e => {
    printProcessError('rln-frontend', e);
  });
  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });
  frontend.on('error', err => {
    console.log('Error while starting frontend with serve. Maybe you forgot to install it with: npm i serve -g');
    process.exit(1);
  });

  projectProc = spawnProject(projectName);
};
