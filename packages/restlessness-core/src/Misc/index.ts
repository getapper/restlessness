import { existsSync, promises as fs } from 'fs';
import path from 'path';

export default class Misc {
  static capitalize = (s: string): string => `${s[0].toUpperCase()}${s.slice(1)}`;
  static camelCaseToDash = (s: string): string => s.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  static copyFile = async (source, target) => {
    let targetFile = target;

    //if target is a directory a new file with the same name will be created
    if (existsSync(target)) {
      if ((await fs.lstat(target)).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    await fs.writeFile(targetFile, await fs.readFile(source));
  };
  static copyFolderRecursive = async (source, target, inside = false) => {
    let files = [];

    let targetFolder = inside ? target : path.join(target, path.basename(source));
    if (!existsSync(targetFolder)) {
      await fs.mkdir(targetFolder);
    }

    if ((await fs.lstat(source)).isDirectory()) {
      files = await fs.readdir(source);
      for (let i=0; i<files.length; i++) {
        var curSource = path.join(source, files[i]);
        if ((await fs.lstat(curSource)).isDirectory()) {
          await Misc.copyFolderRecursive(curSource, targetFolder);
        } else {
          await Misc.copyFile(curSource, targetFolder);
        }
      }
    }
  };
}
