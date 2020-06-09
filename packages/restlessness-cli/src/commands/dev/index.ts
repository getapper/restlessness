import minimist from 'minimist';
import serve from 'serve-handler';

export default async (argv: minimist.ParsedArgs) => {
  const majorVersion: number = parseInt((/^(\d+)(\.\d+){0,2}$/.exec(process.versions.node))[1], 10);
  if (majorVersion < 12) {
    throw new Error('Run command requires node version >= 12.x');
  }

  const backend = spawn('serverless', ['offline', '--port', 4123], {
    cwd: path.join(__dirname, '..', '..', 'assets', 'backend'),
    env: {
      ...process.env,
      PRJ_PATH: process.GLOBAL.CWD,
    },
    stdio: 'inherit',
    shell: true,
  });
  backend.on('error', console.log);
  const frontend = spawn('serve', [], {
    cwd: path.join(__dirname, '..', '..', 'assets', 'frontend', 'build'),
    stdio: 'inherit',
    shell: true,
  });
  frontend.on('error', err => {
    console.log('Error while starting frontend with serve. Maybe you forgot to install it with: npm i serve -g');
    process.exit(1);
  });
};
