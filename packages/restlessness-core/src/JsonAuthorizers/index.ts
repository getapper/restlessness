import PathResolver from '../PathResolver';
import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import PackageJson from '../PackageJson';

export interface JsonAuthorizersEntry extends JsonConfigEntry {
  name: string
  package: string
  shared: boolean
  importKey?: string
}

class JsonAuthorizers extends JsonConfigFile<JsonAuthorizersEntry> {
  get jsonPath(): string {
    return PathResolver.getAuthorizersConfigPath;
  }

  async addEntry(entry: JsonAuthorizersEntry): Promise<void> {
    if (entry.shared) {
      const { name: projectName } = await PackageJson.read();
      entry.importKey = `${projectName}-${entry.id}`;
    }
    return super.addEntry(entry);
  }
}

export default new JsonAuthorizers();
