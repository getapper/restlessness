import { promises as fs } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import PackageJson from '../PackageJson';
import Dao from '../Dao';
import JsonFile from '../JsonFile';
import { promisify } from 'util';
import rimraf from 'rimraf';

export enum EnvType {
  TEST = 'test',
  DEV = 'dev',
  DEPLOY = 'deploy'
}

export enum EnvStage {
  PREPROD = 'dev',
  PRODUCTION = 'prod'
}

export default class JsonEnv extends JsonFile {
  id: string
  type: EnvType
  stage: EnvStage

  static get jsonPath(): string {
    return PathResolver.getEnvsConfigPath;
  }

  static async create(id: string) {
    const jsonEnv = new JsonEnv();
    jsonEnv.id = id;
    jsonEnv.type = EnvType.DEV;
    await JsonEnv.addEntry(jsonEnv);

    /**
     * SIDE EFFECTS
     */

      // Generate a new .env.{envId} file
    const envPath = path.join(PathResolver.getEnvsPath, `.env.${id}`);
    await fs.writeFile(envPath, '');

    // Add a new DEV:{envId} entry in packageJson.scripts
    await PackageJson.merge({
      scripts: {
        [`DEV:${id}`]: `restlessness dev ${id}`,
      },
    });

    // Call DAOs postEnvCreated hook
    // @TODO: think about this is smart enough
    /*
    const daos = await Dao.getList(true);
    for (let dao of daos) {
      try {
        await dao.module.postEnvCreated(PathResolver.getPrjPath, name);
      } catch (e) {
        console.error(`Error when calling afterEnvCreated hook on dao: ${dao.name} (${dao.id})`, e);
      }
    }
     */
  }

  // @TODO
  static async remove(id: string): Promise<void> {
    let jsonEnvs: JsonEnv[] = await JsonEnv.getList<JsonEnv>();
    const jsonEnv = jsonEnvs.find(je => je.id === id);
    if (!jsonEnv) {
      throw new Error('Env not found');
    }
    if (jsonEnv.type !== EnvType.DEV) {
      throw new Error('Only dev envs can be deleted');
    }
    jsonEnvs = jsonEnvs.filter(je => je.id !== id);
    await JsonEnv.saveList(jsonEnvs);

    /**
     * SIDE EFFECTS
     */

      // Delete .env.{envId} file
    await promisify(rimraf)(path.join(PathResolver.getEnvsPath, `.env.${id}`));

    // Remove DEV:{envId} entry in packageJson.scripts
    await PackageJson.removeAtPath(`scripts.DEV:${id}`);
  }
}
