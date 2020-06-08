import path from 'path';
import PathResolver from '../PathResolver';
import AddOnPackage from '../AddOnPackage';

export default class DaoPackage extends AddOnPackage{
  public modelTemplate(modelName: string): string {
    return '';
  }
}
