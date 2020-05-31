import { promises as fs } from 'fs';
import PathResolver from 'root/PathResolver';
import _merge from 'lodash.merge';

export default class PackageJson {
  static get jsonPath(): string {
    return PathResolver.getPackageJsonPath;
  }

  static async read(): Promise<any> {
    return JSON.parse((await fs.readFile(PathResolver.getPackageJsonPath)).toString());
  }

  static async merge(obj): Promise<void> {
    const packageJson = await PackageJson.read();
    _merge(packageJson, obj);
    await PackageJson.write(packageJson);
  }

  static async write(packageJson): Promise<void> {
    await fs.writeFile(PathResolver.getPackageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}
