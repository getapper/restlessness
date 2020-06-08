import path from 'path';
import PathResolver from '../PathResolver';

export default class AddOnPackage {
  static load<T>(packageName: string): T {
    const pkg: T = require(path.join(PathResolver.getNodeModulesPath, packageName));
    return pkg;
  }

  async postInstall(): Promise<void> {
    return null;
  }

  async postEnvCreated(envName: string): Promise<void> {
    return null;
  }
}
