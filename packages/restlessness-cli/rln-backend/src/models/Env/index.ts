import { BaseModel } from 'root/models';
import { JsonEnvs, JsonEnvsEntry, EnvStage, EnvType } from '@restlessness/utilities';

export default class Env extends BaseModel {
  id: string
  type: EnvType
  stage: EnvStage

  static get model() {
    return JsonEnvs;
  }

  protected async fromConfigEntry(entry: JsonEnvsEntry): Promise<void> {
    this.id = entry.id;
    this.type = entry.type;
    this.stage = entry.stage;
  }

  protected async toConfigEntry(): Promise<JsonEnvsEntry> {
    return { ...this };
  }

  async create(name: string) {
    const entry = await JsonEnvs.create(name);
    await this.fromConfigEntry(entry);
  }
}
