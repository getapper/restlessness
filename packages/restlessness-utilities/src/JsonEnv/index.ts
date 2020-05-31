import { promises as fs } from 'fs';
import path from 'path';
import PathResolver from 'root/PathResolver';
import PackageJson from 'root/PackageJson';
import Dao from 'root/Dao';
import JsonFile from 'root/JsonFile';

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
}
