import { promises as fs } from 'fs';
import path from 'path';
import { getPrjRoot } from 'root/services/path-resolver';
import { JsonAuthorizers } from '@restlessness/utilities';

interface Module {
  postEnvCreated: (projectPath: string, envName: string) => void,
}

export interface AuthorizerEntry {
  id: string
  name: string
  package: string
  sessionModelName: string
}

class Authorizer {

  async getList(): Promise<AuthorizerEntry[]> {
    // await JsonAuthorizers.read();
    // return JsonAuthorizers.entries.map(jsonAuthorizer => {
    //   const authorizer = new Authorizer();
    //   authorizer.id = jsonAuthorizer.id;
    //   authorizer.name = jsonAuthorizer.name;
    //   authorizer.package = jsonAuthorizer.package;
    //   authorizer.sessionModelName = jsonAuthorizer.sessionModelName;
    //   return authorizer;
    // });
    return [];
  }

  async getById(authorizerId: string): Promise<AuthorizerEntry> {
    // const authorizer = await JsonAuthorizer.getById<JsonAuthorizer>(authorizerId);
    // if (authorizer) {
    //   Object.assign(this, { ...authorizer });
    //   return true;
    // } else {
    //   return false;
    // }
    return null;
  }
}

export default new Authorizer();
