import { existsSync, promises as fs } from 'fs';
import path from 'path';

const capitalize = (s: string): string => `${s[0].toUpperCase()}${s.slice(1)}`;
const camelCaseToDash = (s: string): string => s.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
const copyFile = async (source, target) => {
  let targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (existsSync(target)) {
    if ((await fs.lstat(target)).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  await fs.writeFile(targetFile, await fs.readFile(source));
};
const copyFolderRecursive = async (source, target, inside = false) => {
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
        await copyFolderRecursive(curSource, targetFolder);
      } else {
        await copyFile(curSource, targetFolder);
      }
    }
  }
};

export {
  capitalize,
  camelCaseToDash,
  copyFile,
  copyFolderRecursive,
};
