import { promises as fs } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import PackageJson from '../PackageJson';
import JsonDaos from '../JsonDaos';
import DaoPackage from '../DaoPackage';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import { promisify } from 'util';
import rimraf from 'rimraf';
import exp = require('constants');

export enum EnvType {
  TEST = 'test',
  DEV = 'dev',
  DEPLOY = 'deploy'
}

export enum EnvStage {
  PREPROD = 'dev',
  PRODUCTION = 'prod'
}

export interface JsonEnvsEntry extends JsonConfigEntry {
  type: EnvType
  stage?: EnvStage
}

class JsonEnvs extends JsonConfigFile<JsonEnvsEntry> {
  get jsonPath(): string {
    return PathResolver.getEnvsConfigPath;
  }

  async create(id: string) {
    await this.addEntry({
      id,
      type: EnvType.DEV,
    });

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
    await JsonDaos.read();
    for (const jsonDaosEntry of JsonDaos.entries) {
      try {
        const daoPackage: DaoPackage = DaoPackage.load(jsonDaosEntry.package);
        await daoPackage.postEnvCreated(PathResolver.getPrjPath, name);
      } catch (e) {
        console.error(`Error when calling afterEnvCreated hook on dao: ${jsonDaosEntry.name} (${jsonDaosEntry.id})`, e);
      }
    }
  }

  async removeById(id: string): Promise<void> {
    const jsonEnvsEntry: JsonEnvsEntry = await this.getEntryById(id);
    if (!jsonEnvsEntry) {
      throw new Error('Env not found');
    }
    if (jsonEnvsEntry.type !== EnvType.DEV) {
      throw new Error('Only dev envs can be deleted');
    }
    await this.removeEntryById(id);

    /**
     * SIDE EFFECTS
     */

      // Delete .env.{envId} file
    await promisify(rimraf)(path.join(PathResolver.getEnvsPath, `.env.${id}`));

    // Remove DEV:{envId} entry in packageJson.scripts
    await PackageJson.removeAtPath(`scripts.DEV:${id}`);
  }
}

export default new JsonEnvs();
