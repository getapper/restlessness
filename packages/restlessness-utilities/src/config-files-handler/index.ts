import path from 'path';
import { promises as fs } from 'fs';

interface JsonAuth {
  id: string,
  name: string,
  functionName: string,
  package: string,
}

interface JsonDao {
  id: string,
  name: string,
  package: string,
}

interface JsonPlugin {
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

const addPlugin = async (projectPath: string, pluginId: string, plugin: JsonPlugin) => {
  const pluginsPath = path.join(projectPath, 'plugins.json');
  const plugins: JsonPlugin[] = require(pluginsPath);
  if (plugins.findIndex((plugin: JsonPlugin) => plugin.id === pluginId) === -1) {
    plugins.push(plugin);
    await fs.writeFile(pluginsPath, JSON.stringify(plugins, null, 2));
  } else {
    console.warn(`${pluginId} plugin already found inside plugins.json!`);
  }
};

const addAuth = async (projectPath: string, authId: string, auth: JsonAuth) => {
  const authPath = path.join(projectPath, 'auths.json');
  const auths: JsonAuth[] = require(authPath);
  if (auths.findIndex((auth: JsonAuth) => auth.id === authId) === -1) {
    auths.push(auth);
    await fs.writeFile(authPath, JSON.stringify(auths, null, 2));
  } else {
    console.warn(`${authId} Auth already found inside auths.json!`);
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
  addPlugin,
  addToEachEnv,
  addToEnv,
  addAuth,
};
