import PathResolver from 'root/PathResolver';
import JsonFile from 'root/JsonFile';

export default class JsonAuthorizer extends JsonFile {
  name: string
  package: string
  sessionModelName: string

  static get jsonPath(): string {
    return PathResolver.getAuthorizersConfigPath;
  }
}
