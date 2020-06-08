import Dao from 'root/models/Dao';
import { BaseModel } from 'root/models';
import { JsonModels, JsonModelsEntry } from '@restlessness/utilities';

export default class Model extends BaseModel {
  id: string
  dao: Dao

  static get model() {
    return JsonModels;
  }

  protected async fromConfigEntry(entry: JsonModelsEntry): Promise<void> {
    const { id, daoId } = entry;
    this.id = id;
    this.dao = await Dao.getById(daoId);
  }

  protected async toConfigEntry(): Promise<JsonModelsEntry> {
    return {
      id: this.id,
      daoId: this.dao?.id,
    };
  }

  async create(id: string, dao?: Dao) {
    const entry = await JsonModels.create(id, dao?.id);
    await this.fromConfigEntry(entry);
  }

}
