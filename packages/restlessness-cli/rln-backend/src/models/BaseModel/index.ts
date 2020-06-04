import { JsonConfigFile, JsonConfigEntry } from '@restlessness/utilities';

export default class BaseModel implements JsonConfigEntry {
  id: string;

  protected static get model(): JsonConfigFile<JsonConfigEntry> {
    throw 'Not implemented!';
  }

  protected async toConfigEntry(): Promise<JsonConfigEntry> {
    throw 'Not implemented!';
  }

  protected async fromConfigEntry(entry: JsonConfigEntry): Promise<void> {
    throw 'Not implemented!';
  }

  private static async _fromConfigEntry<T extends typeof BaseModel>(this: T, entry: JsonConfigEntry): Promise<InstanceType<T>> {
    const e = new this();
    await e.fromConfigEntry(entry);
    return e as InstanceType<T>;
  }

  public static async getById<T extends typeof BaseModel>(this: T, id: string): Promise<InstanceType<T>> {
    return !!id ? await this._fromConfigEntry(await this.model.getEntryById(id)) : null;
  }

  public static async getList<T extends typeof BaseModel>(this: T): Promise<Array<InstanceType<T>>> {
    await this.model.read();
    let entries = await Promise.all(this.model.entries.map(this._fromConfigEntry.bind(this)));
    return entries as Array<InstanceType<T>>;
  }

  public async add(): Promise<void> {
    const cls = <typeof BaseModel>this.constructor;
    await cls.model.addEntry(await this.toConfigEntry());
  }

  public async remove(): Promise<void> {
    const cls = <typeof BaseModel>this.constructor;
    await cls.model.removeEntryById(this.id);
  }
}
