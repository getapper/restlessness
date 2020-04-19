import { addAuth, addToEachEnv } from '@restlessness/utilities';

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  try {
    await addAuth(PROJECT_PATH, 'jwt', {
      id: 'jwt',
      name: 'JWT',
      package: '@restlessness/auth-jwt',
    });
  } catch (e) {
    console.error('Unhandled error while adding jwt to the auths.json file!');
  }
  try {
    await addToEachEnv(PROJECT_PATH, 'jwt', {
      secret: '',
    });
  } catch (e) {
    console.error('Unhandler error while adding jwt config to the environments (envs/*.json) files!');
  }
};

postInstall()
  .then(() => console.log('Jwt AUTH post install success'))
  .catch(err => {
    throw err;
  });
