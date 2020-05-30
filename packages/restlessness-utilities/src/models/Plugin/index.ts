import { promises as fs } from 'fs';
import path from 'path';
import { getNodeModulesPath, getPrjPath } from 'root/services/path-resolver';

interface JsonPlugin {
  id: string,
  name: string,
  package: string,
}

interface Module {
  postEnvCreated: (projectPath: string, envName: string) => void,
}

export default class Plugin {
  id: string
  name: string
  package: string
  module: Module

  static get pluginsJsonPath(): string {
    return path.join(getPrjPath(), 'plugins.json');
  }

  static async getList(withModule: boolean = false): Promise<Plugin[]> {
    const file = await fs.readFile(Plugin.pluginsJsonPath);
    const jsonPlugins: JsonPlugin[] = JSON.parse(file.toString());
    return jsonPlugins.map(jsonPlugin => {
      const plugin = new Plugin();
      plugin.id = jsonPlugin.id;
      plugin.name = jsonPlugin.name;
      plugin.package = jsonPlugin.package;
      if (withModule) {
        plugin.module = require(path.join(getNodeModulesPath(), plugin.package));
      }
      return plugin;
    });
  }

  async getById(pluginId: string): Promise<boolean> {
    const plugins = await Plugin.getList();
    const plugin = plugins.find(d => d.id === pluginId);
    if (plugin) {
      Object.assign(this, { ...plugin });
      this.module = require(path.join(getNodeModulesPath(), this.package));
      return true;
    } else {
      return false;
    }
  }
}
