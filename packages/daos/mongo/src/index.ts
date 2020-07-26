import MongoBase from './base-model';
import mongoDao from './dao';
import { ObjectId } from 'mongodb';
import * as yup from 'yup';
import path from 'path';
import { PathResolver } from '@restlessness/core';
import { DaoPackage, JsonDaos, JsonEnvs, EnvFile } from '@restlessness/core';
import { modelTemplate } from './templates';
import AWSLambda from 'aws-lambda';

class ObjectIdSchema extends yup.mixed {
  constructor() {
    super({ type: 'objectId' });

    // @ts-ignore
    this.withMutation(schema => {
      schema.transform(function(value) {
        return new ObjectId(value);
      });
    });
  }

  _typeCheck(value) {
    return ObjectId.isValid(value);
  }
}

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
      await envFile.setParametricValue('MONGO_URI');
    }));
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    await envFile.setParametricValue('MONGO_URI');
  }

  async beforeLambda<T>(event?: AWSLambda.APIGatewayProxyEventBase<T>, context?: AWSLambda.Context): Promise<void> {
    const projectYup = require(path.join(PathResolver.getNodeModulesPath, 'yup'));
    if (!projectYup.objectId) {
      projectYup.objectId = () => new ObjectIdSchema();
    }
  }

  modelTemplate(modelName: string): string {
    return modelTemplate(modelName);
  }
}

export default new MongoDaoPackage();

export {
  MongoBase,
  mongoDao,
  ObjectId,
};
