import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot } from 'root/services/path-resolver';

interface JsonAuth {
  id: string,
  name: string,
  package: string,
  functionName: string
}

interface Module {
  indexTemplate: (name: string) => string,
  baseModelTemplate: () => string,
  postEnvCreated: (projectPath: string, envName: string) => void,
}

export default class Auth {
  id: string
  name: string
  functionName: string
  package: string

  static get authsJsonPath(): string {
    return path.join(getPrjRoot(), 'auths.json');
  }

  static async getList(): Promise<Auth[]> {
    const file = await fs.readFile(Auth.authsJsonPath);
    const jsonAuths: JsonAuth[] = JSON.parse(file.toString());
    return jsonAuths.map(jsonAuth => {
      const auth = new Auth();
      auth.id = jsonAuth.id;
      auth.name = jsonAuth.name;
      auth.package = jsonAuth.package;
      auth.functionName = jsonAuth.functionName;
      return auth;
    });
  }

  async getById(authId: string): Promise<boolean> {
    const auths = await Auth.getList();
    const auth = auths.find(d => d.id === authId);
    if (auth) {
      Object.assign(this, { ...auth });
      return true;
    } else {
      return false;
    }
  }
}
