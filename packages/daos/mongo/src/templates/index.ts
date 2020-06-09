import pluralize from 'pluralize';

const modelTemplate = (name: string): string => `import { MongoBase, ObjectId } from '@restlessness/dao-mongo';

export default class ${name} extends MongoBase {
  ['constructor']: typeof ${name}
  
  static get collectionName() {
    return '${pluralize(name, 2).toLowerCase()}';
  }
};
`;

export {
  modelTemplate,
};
