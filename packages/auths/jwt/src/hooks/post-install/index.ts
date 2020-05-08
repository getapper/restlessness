import path from 'path';
import { promises as fs, existsSync as existsSync } from 'fs';
import { addAuthorizer, addToEachEnv } from '@restlessness/utilities';
import { jwtAuthorizerTemplate, jwtSessionModelTemplate } from '../../templates';

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];

  try {
    await addAuthorizer(PROJECT_PATH, 'jwt', {
      id: 'jwt',
      name: 'JWT',
      sessionModelName: 'JwtSession',
      package: '@restlessness/auth-jwt',
    }, jwtAuthorizerTemplate(), jwtSessionModelTemplate());
  } catch (e) {
    console.error(e);
    console.error('Unhandled error while adding jwt to the authorizers.json file!');
  }
  try {
    await addToEachEnv(PROJECT_PATH, 'jwt', {
      secret: '$RLN_AUTH_JWT_SECRET',
    });
  } catch (e) {
    console.error(e);
    console.error('Unhandler error while adding jwt config to the environments (envs/*.json) files!');
  }
};

postInstall()
  .then(() => console.log('Jwt AUTH post install success'))
  .catch(err => {
    throw err;
  });
