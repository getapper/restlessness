import pluralize from 'pluralize';

const indexTemplate = (name: string): string => `import { MongoBase, ObjectId } from '@restlessness/dao-mongo';

export default class ${name} extends MongoBase {
  ['constructor']: typeof ${name}
  _id: ObjectId
  
  static get collectionName() {
    return '${pluralize(name, 2).toLowerCase()}';
  }
};
`;

export {
  indexTemplate,
};
