import path from 'path';
import { promises as fs, existsSync as existsSync } from 'fs';
import {jwtAuthorizerTemplate} from "../../templates";

const preInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  const restlessnessConfigPath = path.join(PROJECT_PATH, '.restlessness.json');
  try {
    require(restlessnessConfigPath);
  } catch (e) {
    throw new Error(`Restlessness project not found in ${PROJECT_PATH}`);
  }

  const folderPath = path.join(PROJECT_PATH, 'src', 'auths');
  const existsFolder = await existsSync(folderPath)
  if (!existsFolder) {
    try {
      await fs.mkdir(folderPath);
    } catch(e) {
      throw new Error(`Error creating ${folderPath} auths folder`);
    }
  }

  const authFilePath = path.join(folderPath, 'jwt.ts');
  const existsFile = await existsSync(authFilePath)
  if (!existsFile) {
    try {
      await fs.writeFile(authFilePath, jwtAuthorizerTemplate());
    } catch(e) {
      throw new Error(`Error creating ${authFilePath} jwt auth file`);
    }
  } else {
    throw new Error(`Jwt auth file already exists`);
  }
};

preInstall()
  .then()
  .catch(err => {
    console.error(err)
    process.exit(1);
  });
