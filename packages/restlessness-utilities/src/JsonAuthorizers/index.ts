import PathResolver from '../PathResolver';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';

export interface JsonAuthorizersEntry extends JsonConfigEntry {
  package: string
  sessionModelName: string
}

class JsonAuthorizers extends JsonConfigFile<JsonAuthorizersEntry> {
  get jsonPath(): string {
    return PathResolver.getAuthorizersConfigPath;
  }
}

export default new JsonAuthorizers();
