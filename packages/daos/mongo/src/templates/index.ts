import pluralize from 'pluralize';

const modelTemplate = (name: string): string => `import { MongoBase, ObjectId } from '@restlessness/dao-mongo';

export interface I${name} {}

export default class ${name} extends MongoBase implements I${name} {
  ['constructor']: typeof ${name}
  
  static get collectionName() {
    return '${pluralize(name, 2).toLowerCase()}';
  }
};
`;

export {
  modelTemplate,
};
