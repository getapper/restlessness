import { JsonConfigFile, JsonConfigEntry } from '@restlessness/utilities';

export default abstract class UiModel<T extends JsonConfigFile<V>,V extends JsonConfigEntry, U> {

  constructor(protected model: T) {
  }

  protected abstract async mapModelToUi(entry: V): Promise<U>

  protected abstract async mapUiToModel(entry: U): Promise<V>

  async getById(id: string): Promise<U> {
    return this.mapModelToUi(await this.model.getEntryById(id));
  }

  async getList(): Promise<U[]> {
    await this.model.read();
    return Promise.all(this.model.entries.map(this.mapModelToUi));
  }

  async add(entry: U): Promise<void> {
    await this.model.addEntry(await this.mapUiToModel(entry));
  }

  async removeById(id: string): Promise<void> {
    await this.model.removeEntryById(id);
  }
}
