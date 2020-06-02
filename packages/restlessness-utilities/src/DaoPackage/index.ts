import path from 'path';
import PathResolver from '../PathResolver';

export default class DaoPackage {
  indexTemplate: (name: string) => string
  baseModelTemplate: () => string
  postEnvCreated: (projectPath: string, envName: string) => void

  static load(daoPackageName: string): DaoPackage {
    const daoPackage = new DaoPackage();
    Object.assign(this, require(path.join(PathResolver.getNodeModulesPath, daoPackageName)));
    return daoPackage;
  }
}
