import PathResolver from '../PathResolver';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';

export interface JsonPluginsEntry extends JsonConfigEntry {
  name: string
  package: string
}

class JsonDaos extends JsonConfigFile<JsonPluginsEntry> {
  get jsonPath(): string {
    return PathResolver.getPluginsConfigPath;
  }
}

export default new JsonDaos();
