import PathResolver from '../PathResolver';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';

export interface JsonDaosEntry extends JsonConfigEntry {
  name: string
  package: string
  sessionModelName: string
}

class JsonDaos extends JsonConfigFile<JsonDaosEntry> {
  get jsonPath(): string {
    return PathResolver.getAuthorizersConfigPath;
  }
}

export default new JsonDaos();
