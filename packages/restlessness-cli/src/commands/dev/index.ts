import minimist from 'minimist';
import path from 'path';
import { ChildProcess, spawn } from 'child_process';
import chalk from 'chalk';

const printRestlessnessData = d => {
  process.stdout.write(`${chalk.blue('RESTLESSNESS')}: ${d.toString()}`);
};
const printRestlessnessError = e => {
  process.stderr.write(chalk.red(`RESTLESSNESS error:\n${e.toString()}`));
};

function getProjectName() {
  try {
    return require(path.join(process.cwd(), 'package.json')).name;
  } catch {
    console.log(chalk.red('Cannot find package.json. Are you on the root folder?'));
    process.exit(1);
  }
}

function spawnBackend(): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('serverless', ['offline', '--port', '4123'], {
      cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'backend'),
      env: {
        ...process.env,
        RLN_PROJECT_PATH: process.cwd(),
      },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      shell: true,
    });
    proc.stdout.on('data', d => {
      let data = d.toString();
      if (data.indexOf('Serverless: Offline [HTTP] listening on') !== -1) {
        resolve(proc);
      }

      let trimmed = data.trim();
      if (trimmed && !trimmed.startsWith('Serverless:')) {
        printRestlessnessData(data);
      }
    });
    proc.stderr.on('data', printRestlessnessError);
    proc.on('error', reject);
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
  });
}

function spawnProject(name): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const proc = spawn('serverless', ['offline', '--port', '4000'], {
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
  });
}

export default async (argv: minimist.ParsedArgs) => {
  const projectName = getProjectName();

  let projectProc;
  let frontendProc;
  let backendProc;

  const terminate = () => {
    projectProc?.kill();
    frontendProc?.kill();
    backendProc?.kill();
  };
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    terminate();
  });

  try {
    backendProc = await spawnBackend();
    backendProc.on('message', async message => {
      if (message === 'RESTART_PROJECT') {
        projectProc?.kill();
        console.log(`Restarting project ${projectName}...`);
        projectProc = await spawnProject(projectName);
      }
    });
  } catch (e) {
    console.error(chalk.red('Error while starting serverless. Maybe you forgot to install it with: npm i serverless -g'));
    console.error(e);
    terminate();
  }

  try {
    frontendProc = await spawnFrontend();
    printRestlessnessData('Running on http://localhost:5000\n');
  } catch (e) {
    console.error(chalk.red('Error while starting serve. Maybe you forgot to install it with: npm i serve -g'));
    console.error(e);
    terminate();
  }

  try {
    projectProc = await spawnProject(projectName);
  } catch (e) {
    console.error(chalk.red('Error while starting serverless. Maybe you forgot to install it with: npm i serverless -g'));
    console.error(e);
    terminate();
  }
};
