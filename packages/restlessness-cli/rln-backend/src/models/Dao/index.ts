import { BaseModel } from 'root/models';
import { JsonDaos, JsonDaosEntry } from '@restlessness/utilities';

export default class Dao extends BaseModel {
  id: string
  name: string
  package: string

  static get model() {
    return JsonDaos;
  }

  protected async fromConfigEntry(entry: JsonDaosEntry): Promise<void> {
    const { id, name, package: pkg } = entry;
    this.id = id;
    this.name = name;
    this.package = pkg;
  }

  protected async toConfigEntry(): Promise<JsonDaosEntry> {
    return { ...this };
  }
}
