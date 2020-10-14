import { existsSync, promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  static createAwsSafeFunctionName = (functionId: string, fullServiceName: string) => {
    const id = functionId; //@TODO check for symbols presence (-./ etc..)
    /**
     * The 4 xxxx stand for "dev" or "prod", based on which stage deployment will be selected
     * We use 4 x for worst case scenario, that is "prod", since we need to check this string length
     * and to avoid it will reach 64 chars, since AWS complains about that
     */
    let safeFunctionName: string = id;
    const awsLambdaName: string = `${id}LambdaFunction`;
    if (awsLambdaName.length > 63) {
      const hash = crypto.createHash('md5').update(id).digest('hex');
      safeFunctionName = `${id.substring(0, 21)}${hash.substring(0, 3)}${id.substring(id.length - 21)}`;
    }
    const awsFunctionName: string = `${fullServiceName}-xxxx-${id}`;
    if (awsFunctionName.length > 63) {
      const hash = crypto.createHash('md5').update(id).digest('hex');
      const chars = Math.floor((64 - `${fullServiceName}-xxxx-`.length - 10) / 2);
      safeFunctionName = `${id.substring(0, chars)}${hash.substring(0, 3)}${id.substring(id.length - chars)}`;
    }
    return safeFunctionName;
  };
}
