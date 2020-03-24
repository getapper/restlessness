import { promises as fs } from 'fs';
import path from 'path';
import { getNodeModulesRoot, getPrjRoot } from 'root/services/path-resolver';

interface JsonEnv {
  id: number,
  name: string,
  type: string,
}

export default class Env {
  id: number
  name: string
  type: string

  static get envsJsonPath(): string {
    return path.join(getPrjRoot(), 'envs.json');
  }

  static async getList(): Promise<Env[]> {
    const file = await fs.readFile(Env.envsJsonPath);
    const jsonEnvs: JsonEnv[] = JSON.parse(file.toString());
    return jsonEnvs.map(jsonEnv => {
      const env = new Env();
      env.id = jsonEnv.id;
      env.name = jsonEnv.name;
      env.type = jsonEnv.type;
      return env;
    });
  }

  async getById(envId: number): Promise<boolean> {
    const envs = await Env.getList();
    const env = envs.find(d => d.id === envId);
    if (env) {
      Object.assign(this, { ...env });
      return true;
    } else {
      return false;
    }
  }
}
