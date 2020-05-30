import { promises as fs } from 'fs';
import path from 'path';
import { getPrjPath } from 'root/services/path-resolver';

interface JsonAuthorizer {
  id: string,
  name: string,
  package: string,
  sessionModelName: string
}

interface Module {
  postEnvCreated: (projectPath: string, envName: string) => void,
}

export default class Authorizer {
  id: string
  name: string
  package: string
  sessionModelName: string

  static get authorizersJsonPath(): string {
    return path.join(getPrjPath(), 'authorizers.json');
  }

  static async getList(): Promise<Authorizer[]> {
    const file = await fs.readFile(Authorizer.authorizersJsonPath);
    const jsonAuthorizers: JsonAuthorizer[] = JSON.parse(file.toString());
    return jsonAuthorizers.map(jsonAuthorizer => {
      const authorizer = new Authorizer();
      authorizer.id = jsonAuthorizer.id;
      authorizer.name = jsonAuthorizer.name;
      authorizer.package = jsonAuthorizer.package;
      authorizer.sessionModelName = jsonAuthorizer.sessionModelName;
      return authorizer;
    });
  }

  async getById(authorizerId: string): Promise<boolean> {
    const authorizers = await Authorizer.getList();
    const authorizer = authorizers.find(d => d.id === authorizerId);
    if (authorizer) {
      Object.assign(this, { ...authorizer });
      return true;
    } else {
      return false;
    }
  }
}
