import MongoBase from './base-model';
import mongoDao from './dao';
import { ObjectId } from 'mongodb';
import { DaoPackage, JsonDaos } from '@restlessness/utilities';

export * from './hooks';
export * from './templates';
export {
  MongoBase,
  mongoDao,
  ObjectId,
};

class MongoDaoPackage extends DaoPackage {
  async postInstall(): Promise<void> {
    await JsonDaos.addEntry({
      id: 'dao-mongo',
      name: 'Mongo DAO',
      package: '@restlessness/dao-mongo',
    });
    // @TODO: Add RLN URI to each env
  }

  async postEnvCreated(envName: string): Promise<void> {
    // @TODO: Add RLN URI to env
  }

  async beforeLambda(): Promise<void> {
    // @TODO: open connection
  }
}
