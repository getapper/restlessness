import path from 'path';
import { promises as fs } from 'fs';

interface JsonDao {
  id: string,
  name: string,
  package: string,
}

interface JsonEnv {
  id: number,
  name: string,
  type: string,
}

const addDao = async (projectPath: string, daoId: string, dao: JsonDao) => {
  const daosPath = path.join(projectPath, 'daos.json');
  const daos: JsonDao[] = require(daosPath);
  if (daos.findIndex((dao: JsonDao) => dao.id === daoId) === -1) {
    daos.push(dao);
    await fs.writeFile(daosPath, JSON.stringify(daos, null, 2));
  } else {
    console.warn(`${daoId} DAO already found inside daos.json!`);
  }
};

const addToEachEnv = async (projectPath: string, key: string, value: any) => {
  const envsPath = path.join(projectPath, 'envs.json');
  const jsonEnvs: JsonDao[] = require(envsPath);
  for (let jsonEnv of jsonEnvs) {
    const envName = jsonEnv.name;
    try {
      await addToEnv(projectPath, envName, key, value);
    } catch (e) {
      console.error(`Error writing to env file: ${jsonEnv?.name}`);
    }
  }
};

const addToEnv = async (projectPath: string, envName: string, key: string, value: any) => {
  const envPath = path.join(projectPath, 'envs', `${envName}.json`);
  const env = require(envPath);
  if (typeof env[key] === 'undefined') {
    env[key] = value;
    await fs.writeFile(envPath, JSON.stringify(env, null, 2));
  } else {
    console.warn(`${key} key already found inside envs/${envName}.json environment!`);
  }
};

export {
  addDao,
  addToEachEnv,
  addToEnv,
};
