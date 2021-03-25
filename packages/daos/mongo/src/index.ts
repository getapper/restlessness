import MongoBase from './base-model';
import mongoDao from './dao';
import { ObjectId } from 'mongodb';
import * as yup from 'yup';
import path from 'path';
import { PathResolver, JsonEnvsEntry } from '@restlessness/core';
import { DaoPackage, JsonDaos, JsonEnvs, EnvFile, JsonServices } from '@restlessness/core';
import { modelTemplate } from './templates';
import AWSLambda from 'aws-lambda';
import { exec } from 'child_process';
import { promisify } from 'util';

const yupObjectId = () => yup
  .mixed()
  .transform((value, originalValue) => {
    if (value === null) {
      return null;
    }
    if (!ObjectId.isValid(value)) {
      return null;
    }
    return new ObjectId(value);
  })
  .test(
    'isValidObjectId',
    'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters',
    function (value) {
      const { path, createError } = this;

      if (value === null) {
        return createError({ path });
      }

      return true;
    },
  );

/**
 * @deprecated
 */
class ObjectIdSchema extends yup.mixed {
  constructor() {
    super({ type: 'objectId' });

    // @ts-ignore
    this.withMutation(schema => {
      schema.transform(function(value) {
        if (value === null) {
          return null;
        }
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
    await promisify(exec)('npm i -E serverless-mongo-proxy', { cwd: PathResolver.getPrjPath });
    await JsonServices.read();
    await JsonServices.addPlugin(JsonServices.SHARED_SERVICE_NAME, 'serverless-mongo-proxy');
    this.addProxyPermissions();
    await JsonServices.save();
  }

  addProxyPermissions() {
    for (let service of Object.values(JsonServices.services)) {
      const { provider } = service;
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
  }

  async postEnvCreated(envName: string): Promise<void> {
    await JsonEnvs.read();
    const jsonEnvsEntry = await JsonEnvs.getEntryById(envName);
    await this.addEnv(jsonEnvsEntry);
  }

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {
    const envFile = new EnvFile(jsonEnvsEntry.id);
    await envFile.setParametricValue('MONGO_URI');
    await envFile.setParametricValue('MONGO_DB_NAME');
  }

  async beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {
    /**
     * @deprecated
     */
    const projectYup = require(path.join(PathResolver.getNodeModulesPath, 'yup'));
    if (!projectYup.objectId) {
      projectYup.objectId = () => new ObjectIdSchema();
    }
  }

  async beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context): Promise<void> {}

  modelTemplate(modelName: string): string {
    return modelTemplate(modelName);
  }
}

export default new MongoDaoPackage();

export {
  MongoBase,
  mongoDao,
  ObjectId,
  yupObjectId,
};
