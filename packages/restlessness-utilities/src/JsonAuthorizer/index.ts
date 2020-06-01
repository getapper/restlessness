import PathResolver from '../PathResolver';
import JsonFile from '../JsonFile';

export default class JsonAuthorizer extends JsonFile {
  name: string
  package: string
  sessionModelName: string

  static get jsonPath(): string {
    return PathResolver.getAuthorizersConfigPath;
  }
}
