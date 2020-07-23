import {
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  FindOneOptions,
  DeleteWriteOpResultObject,
  IndexOptions,
} from 'mongodb';
import { Lambda } from 'aws-sdk';
import yaml from 'js-yaml';
import { readFileSync, existsSync } from 'fs';
import { PathResolver } from '@restlessness/core';
import path from 'path';

interface ProxyRequest {
  collectionName: string
  operation: string
  args: any[]
}

class MongoDao {
  mongoProxy: Lambda
  proxyFunctionName = '_serverless-mongo-proxy'
  defaultParams

  constructor() {
    this.mongoProxy = new Lambda(
      process.env['IS_OFFLINE'] ? { endpoint: 'http://localhost:4000' } : {});

    const serverlessYml = this.getServerlessYml();
    const serviceName = serverlessYml.service;
    const stage = serverlessYml?.provider?.stage || 'dev';
    this.defaultParams = {
      FunctionName: `${serviceName}-${stage}-${this.proxyFunctionName}`,
      InvocationType: 'RequestResponse',
    };
  }

  async invokeProxy(request: ProxyRequest) {
    let invocationResult;
    try {
      invocationResult = await this.mongoProxy.invoke({
        ...this.defaultParams,
        Payload: JSON.stringify(request),
      }).promise();
    } catch (e) {
      throw new Error(`Error invoking mongodb proxy function, ${e}`);
    }

    const { StatusCode, Payload } = invocationResult;
    const error = (Payload as any)?.error;

    if (error) {
      throw new Error(error.message);
    }

    if (StatusCode !== 200) {
      throw new Error(`Error invoking mongodb proxy function, status code ${StatusCode}`);
    }

    return Payload;
  }

  getServerlessYml() {
    let serverlessFile;
    if (existsSync(path.join(PathResolver.getPrjPath, 'serverless.yml'))) {
      serverlessFile = path.join(PathResolver.getPrjPath, 'serverless.yml');
    } else if (existsSync(path.join(PathResolver.getPrjPath, 'serverless.yaml'))) {
      serverlessFile = path.join(PathResolver.getPrjPath, 'serverless.yaml');
    }

    if (!serverlessFile) {
      throw new Error('Cannot find serverless file under project root!');
    }

    try {
      return yaml.safeLoad(readFileSync(serverlessFile));
    } catch (e) {
      throw new Error('Error reading serverless file!');
    }
  }

  async findOne(collectionName: string, filters, options?): Promise<any> {
    return this.invokeProxy({ collectionName, operation: 'findOne', args: [filters, options] });
  }

  async find(collectionName: string, query, options?: FindOneOptions): Promise<any> {
    return this.invokeProxy({ collectionName, operation: 'find', args: [query, options] });
  }

  async insertOne(collectionName: string, object): Promise<InsertOneWriteOpResult<null>> {
    return this.invokeProxy({ collectionName, operation: 'insertOne', args: [object] });
  }

  async updateOne(collectionName: string, filter, object): Promise<UpdateWriteOpResult> {
    return this.invokeProxy({ collectionName, operation: 'updateOne', args: [filter, object] });
  }

  async deleteOne(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    return this.invokeProxy({ collectionName, operation: 'deleteOne', args: [filter] });
  }

  async deleteMany(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    return this.invokeProxy({ collectionName, operation: 'deleteMany', args: [filter] });
  }

  async createIndex(collectionName: string, keys: string | any, options: IndexOptions): Promise<string> {
    return this.invokeProxy({ collectionName, operation: 'createIndex', args: [keys, options] });
  }
}

const mongoDao = new MongoDao();

export default mongoDao;

export {
  MongoDao,
};
