import path from 'path';
import PathResolver from '../PathResolver';
import AddOnPackage from '../AddOnPackage';

export default abstract class DaoPackage extends AddOnPackage {
  abstract modelTemplate(modelName: string): string
}
