import { JsonAuthorizers, JsonAuthorizersEntry } from '@restlessness/core';
import { BaseModel } from '../';

export default class Authorizer extends BaseModel {
  id: string
  name: string
  package: string
  sessionModelName: string

  static get model() {
    return JsonAuthorizers;
  }

  protected async fromConfigEntry(entry: JsonAuthorizersEntry): Promise<void> {
    const { id, name, package: pkg } = entry;
    this.id = id;
    this.name = name;
    this.package = pkg;
  }

  protected async toConfigEntry(): Promise<JsonAuthorizersEntry> {
    return { ...this };
  }
}
