import MongoBase from './base-model';
import mongoDao from './dao';
import { ObjectId } from 'mongodb';
import { DaoPackage, JsonDaos, JsonEnvs, EnvFile } from '@restlessness/utilities';

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
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(async jsonEnvsEntry => {
      const envFile = new EnvFile(jsonEnvsEntry.id);
      await envFile.setValue('RLN_MONGO_DAO_URI', `{RLN_MONGO_DAO_URI_${jsonEnvsEntry.id.toUpperCase()}}`);
    }));
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    await envFile.setValue('RLN_MONGO_DAO_URI', `{RLN_MONGO_DAO_URI_${envName.toUpperCase()}}`);
  }

  async beforeLambda(): Promise<void> {
    // @TODO: open connection
  }
}

export default new MongoDaoPackage();
