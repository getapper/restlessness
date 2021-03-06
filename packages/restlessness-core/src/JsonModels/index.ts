import fsSync, { promises as fs } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import DaoPackage from '../DaoPackage';
import { indexTemplate } from './templates';
import Misc from '../Misc';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import JsonDaos, { JsonDaosEntry } from '../JsonDaos';

export interface JsonModelsEntry extends JsonConfigEntry {
  daoId?: string
}

class JsonModel extends JsonConfigFile<JsonModelsEntry> {
  get jsonPath(): string {
    return PathResolver.getModelsConfigPath;
  }

  async create(id: string, daoId?: string, template?: string): Promise<JsonModelsEntry> {
    const jsonModelsEntry = {
      id,
      daoId: null,
    };
    if (daoId) {
      if (!(await JsonDaos.getEntryById(daoId))) {
        throw new Error('Dao with this id not found in daos json config file');
      } else {
        jsonModelsEntry.daoId = daoId;
      }
    }
    await this.addEntry(jsonModelsEntry);

    /**
     * SIDE EFFECTS
     */

    // Generate new model folder
    if (!fsSync.existsSync(PathResolver.getModelsPath)) {
      await fs.mkdir(PathResolver.getModelsPath);
    }
    const modelName = Misc.capitalize(id);
    const folderPath = path.join(PathResolver.getModelsPath, modelName);
    await fs.mkdir(folderPath);

    // Generate model file based on daoId
    if (!daoId) {
      await fs.writeFile(path.join(folderPath, 'index.ts'), template || indexTemplate(modelName));
    } else {
      const jsonDaosEntry: JsonDaosEntry = await JsonDaos.getEntryById(daoId);
      const daoPackage: DaoPackage = DaoPackage.load(jsonDaosEntry.package);
      await fs.writeFile(path.join(folderPath, 'index.ts'), daoPackage.modelTemplate(modelName));
    }

    return jsonModelsEntry;
  }
}

export default new JsonModel();
