import MongoBase from './base-model';
import mongoDao from './dao';
import { ObjectId } from 'mongodb';
import * as yup from 'yup';
import path from 'path';
import { PathResolver, JsonEnvsEntry } from '@restlessness/core';
import { DaoPackage, JsonDaos, JsonEnvs, EnvFile } from '@restlessness/core';
import { modelTemplate } from './templates';
import AWSLambda from 'aws-lambda';
import { JsonServerless } from '@restlessness/core/dist';
import { exec } from 'child_process';
import { promisify } from 'util';

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
    await Promise.all(JsonEnvs.entries.map(this.addEnv));
    await this.installProxy();
  }

  async installProxy() {
    await promisify(exec)('npm i -E serverless-mongo-proxy');
    await JsonServerless.read();
    await JsonServerless.addPlugin('serverless-mongo-proxy');
    this.addProxyPermissions();
    await JsonServerless.save();
  }

  addProxyPermissions() {
    const { provider } = JsonServerless;
    if (provider.name === 'aws') {
      const statement = provider.iamRoleStatements?.find(
        s => s['Effect'] === 'Allow' &&
          s['Resource'] === '*' &&
          s['Action'].includes('lambda:InvokeFunction')
      );
      if (!statement) {
        const invokeStatement = {
          'Effect': 'Allow',
          'Resource': '*',
          'Action': ['lambda:InvokeFunction'],
        };
        if (!provider.iamRoleStatements) {
          provider.iamRoleStatements = [];
        }
        provider.iamRoleStatements.push(invokeStatement);
      }
    }
  }

  async postEnvCreated(envName: string): Promise<void> {
    await JsonEnvs.read();
    const jsonEnvsEntry = await JsonEnvs.getEntryById(envName);
    await this.addEnv(jsonEnvsEntry);
  }

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {
    const envFile = new EnvFile(jsonEnvsEntry.id);
    await envFile.setParametricValue('MONGO_URI');
    const stageName = jsonEnvsEntry.type === 'deploy' ? jsonEnvsEntry.stage : jsonEnvsEntry.type;
    await envFile.setValue('STAGE_NAME', stageName);
    if (jsonEnvsEntry.type === 'test') {
      await envFile.setValue('IS_OFFLINE', 'true');
    }
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
