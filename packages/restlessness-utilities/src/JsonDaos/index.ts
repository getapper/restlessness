import PathResolver from '../PathResolver';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';

export interface JsonDaosEntry extends JsonConfigEntry {
  name: string
  package: string
}

class JsonDaos extends JsonConfigFile<JsonDaosEntry> {
  get jsonPath(): string {
    return PathResolver.getDaosConfigPath;
  }
}

export default new JsonDaos();
