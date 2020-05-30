import { promises as fs } from 'fs';
import path from 'path';
import { getPrjPath } from 'root/services/path-resolver';
import { Dao } from 'root/models';

export enum EnvType {
  TEST = 'test',
  DEV = 'dev',
  DEPLOY = 'deploy'
}

export enum EnvStage {
  PREPROD = 'dev',
  PRODUCTION = 'prod'
}

interface JsonEnv {
  id: number,
  name: string,
  type: EnvType,
  stage: EnvStage,
}

export default class Env {
  id: number
  name: string
  type: EnvType
  stage: EnvStage

  static get envsJsonPath(): string {
    return path.join(getPrjPath(), 'envs.json');
  }

  static async getList(): Promise<Env[]> {
    const file = await fs.readFile(Env.envsJsonPath);
    const jsonEnvs: JsonEnv[] = JSON.parse(file.toString());
    return jsonEnvs.map(jsonEnv => {
      const env = new Env();
      env.id = jsonEnv.id;
      env.name = jsonEnv.name;
      env.type = jsonEnv.type;
      env.stage = jsonEnv.stage;
      return env;
    });
  }

  static async saveList(envs: Env[]) {
    const jsonEnvs: JsonEnv[] = envs.map(env => ({
      ...env,
    }));
    await fs.writeFile(Env.envsJsonPath, JSON.stringify(jsonEnvs, null, 2));
  }

  async create(name: string) {
    this.name = name;
    this.type = EnvType.DEV;
    this.stage = null;
    const envs = await Env.getList();
    this.id = (envs
      .map(endpoint => endpoint.id)
      .reduce((max, curr) => Math.max(max, curr), 0) || 0) + 1;
    envs.push(this);
    await Env.saveList(envs);
    const envPath = path.join(getPrjPath(), 'envs', `${name}.json`);
    await fs.writeFile(envPath, JSON.stringify({ name }, null, 2));
    const packageJsonPath = path.join(getPrjPath(), 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.scripts = packageJson?.scripts || {};
    if ((packageJson?.scripts?.[`DEV:${name}`] ?? null) === null) {
      packageJson.scripts[`DEV:${name}`] = `cp envs/${name}.json env.json && tsc && RLN_ENV=${name} serverless offline --host 0.0.0.0`;
    } else {
      console.warn(`Package Json Script command already found: DEV:${name}`);
    }
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    const daos = await Dao.getList(true);
    for (let dao of daos) {
      try {
        await dao.module.postEnvCreated(getPrjPath(), name);
      } catch (e) {
        console.error(`Error when calling afterEnvCreated hook on dao: ${dao.name} (${dao.id})`, e);
      }
    }
  }
}
