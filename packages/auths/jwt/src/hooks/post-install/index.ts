import path from 'path';
import { promises as fs, existsSync as existsSync } from 'fs';
import { addAuth, addToEachEnv } from '@restlessness/utilities';
import {jwtAuthorizerTemplate} from "../../templates";

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  const fileName = 'jwt'

  const folderPath = path.join(PROJECT_PATH, 'src', 'auths');
  const existsFolder = await existsSync(folderPath)
  if (!existsFolder) {
    try {
      await fs.mkdir(folderPath);
    } catch(e) {
      throw new Error(`Error creating ${folderPath} auths folder`);
    }
  }

  const authFilePath = path.join(folderPath, `${fileName}.ts`);
  const existsFile = await existsSync(authFilePath)
  if (!existsFile) {
    try {
      await fs.writeFile(authFilePath, jwtAuthorizerTemplate());
    } catch(e) {
      throw new Error(`Error creating ${authFilePath} jwt auth file`);
    }
  }
  try {
    await addAuth(PROJECT_PATH, 'jwt', {
      id: 'jwt',
      name: fileName,
      functionName: `${fileName}.authorizer`,
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
