import { promises as fs } from 'fs';
import path from 'path';
import { getModelsRoot, getPrjRoot } from 'root/services/path-resolver';
import Dao from 'root/models/Dao';
import { indexTemplate } from 'root/models/Model/templates';
import { capitalize } from 'root/services/util';

interface JsonModel {
  id: string,
  name: string,
  daoId: string,
}

export default class Model {
  id: string
  name: string
  dao: Dao

  static get modelsJsonPath(): string {
    return path.join(getPrjRoot(), 'models.json');
  }

  static async getList(): Promise<Model[]> {
    const file = await fs.readFile(Model.modelsJsonPath);
    const jsonModels: JsonModel[] = JSON.parse(file.toString());
    const daos = await Dao.getList();
    return jsonModels.map(jsonModel => {
      const model = new Model();
      model.id = jsonModel.id;
      model.name = jsonModel.name;
      model.dao = daos.find(d => d.id === jsonModel.daoId);
      return model;
    });
  }

  async create(dao: Dao, name: string): Promise<boolean> {
    const modelName = capitalize(name);
    const folderPath = path.join(getModelsRoot(), modelName);
    await fs.mkdir(folderPath);
    if (!dao) {
      await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(modelName));
    } else {
      await fs.writeFile(path.join(folderPath, 'index.ts'), dao.module.indexTemplate(modelName));
    }
    return true;
  }

  toJSON() {
    return {
      ...this,
      dao: this.dao.name,
    };
  }
}
