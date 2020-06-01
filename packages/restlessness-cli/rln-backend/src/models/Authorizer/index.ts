import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot } from 'root/services/path-resolver';
import { JsonAuthorizer } from '@restlessness/utilities';

// interface JsonAuthorizer {
//   id: string,
//   name: string,
//   package: string,
//   sessionModelName: string
// }

interface Module {
  postEnvCreated: (projectPath: string, envName: string) => void,
}

export default class Authorizer {
  id: string
  name: string
  package: string
  sessionModelName: string

  static async getList(): Promise<Authorizer[]> {
    const jsonAuthorizers: JsonAuthorizer[] = await JsonAuthorizer.getList<JsonAuthorizer>();
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
    const authorizer = await JsonAuthorizer.getById<JsonAuthorizer>(authorizerId);
    if (authorizer) {
      Object.assign(this, { ...authorizer });
      return true;
    } else {
      return false;
    }
  }
}
