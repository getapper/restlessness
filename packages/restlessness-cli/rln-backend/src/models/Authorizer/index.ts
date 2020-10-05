import { JsonAuthorizers, JsonAuthorizersEntry } from '@restlessness/core';
import { BaseModel } from '../';

export default class Authorizer extends BaseModel {
  id: string
  name: string
  package: string
  shared: boolean

  static get model() {
    return JsonAuthorizers;
  }

  protected async fromConfigEntry(entry: JsonAuthorizersEntry): Promise<void> {
    Object.assign(this, entry);
  }

  protected async toConfigEntry(): Promise<JsonAuthorizersEntry> {
    return { ...this };
  }
}
