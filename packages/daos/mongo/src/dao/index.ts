import {
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  FindOneOptions,
  DeleteWriteOpResultObject,
  IndexOptions,
  UpdateOneOptions,
  MongoCountPreferences,
  UpdateManyOptions,
} from 'mongodb';
import Bson from 'bson';
import { Lambda } from 'aws-sdk';
import { JsonServices, JsonEnvs, PathResolver } from '@restlessness/core';
import path from 'path';

interface ProxyRequest {
  collectionName: string
  operation: string
  args: any[]
}

interface ProxyResponse {
  responseBufferValues?: number[]
  error?: string
  errorType?: string
  errorMessage?: string
}

class MongoDao {
  mongoProxy: Lambda
  proxyFunctionName = '_serverless-mongo-proxy'

  constructor() {
    this.mongoProxy = new Lambda({});
  }

  private async invokeLocal(serializedRequest: string): Promise<Lambda.InvocationResponse> {
    const proxyPath = path.join(PathResolver.getNodeModulesPath, 'serverless-mongo-proxy', 'dist', 'proxy');
    const proxy = require(proxyPath).default;
    const request = JSON.parse(serializedRequest);
    const payload = await proxy(request, {});
    return {
      StatusCode: payload?.error ? 500 : 200,
      Payload: JSON.stringify(payload),
    };
  }

  private async invokeLambda(serializedRequest: string) {
    await JsonServices.read();
    await JsonEnvs.read();
    const jsonEnvsEntry = await JsonEnvs.getEntryById(process.env['ENV_NAME']);
    const stage = jsonEnvsEntry.type === 'deploy' ? jsonEnvsEntry.stage : jsonEnvsEntry.type;
    return await this.mongoProxy.invoke({
      FunctionName: `${JsonServices.sharedService.service}-${stage}-${this.proxyFunctionName}`,
      InvocationType: 'RequestResponse',
      Payload: serializedRequest,
    }).promise();
  }

  async invokeProxy(request: ProxyRequest) {
    let serializedRequest: string;
    try {
      serializedRequest = JSON.stringify({
        requestBufferValues: Array.from(Bson.serialize(request).values()),
      });
    } catch (e) {
      throw new Error(`Error on bson serialize, ${e}`);
    }

    let invocationResult: Lambda.InvocationResponse;
    try {
      if (process.env['IS_OFFLINE']) {
        invocationResult = await this.invokeLocal(serializedRequest);
      } else {
        invocationResult = await this.invokeLambda(serializedRequest);
      }
    } catch (e) {
      throw new Error(`Error invoking mongodb proxy function, ${e}`);
    }

    const { StatusCode, Payload } = invocationResult;

    if (StatusCode !== 200) {
      throw new Error(`Error invoking mongodb proxy function, status code ${StatusCode}`);
    }

    let response: ProxyResponse;
    try {
      response = JSON.parse(typeof Payload === 'string' ? Payload : Payload.toString());
    } catch (e) {
      throw new Error(`Error parsing json payload, ${e}`);
    }

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.errorMessage) {
      throw new Error(`${response.errorType}: ${response.errorMessage}`);
    }

    try {
      return Bson.deserialize(Buffer.from(response.responseBufferValues)).result;
    } catch (e) {
      throw new Error(`Error on bson deserialize, ${e}, Request: ${JSON.stringify(request)}, Response: ${JSON.stringify(response)}`);
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

  async updateOne(collectionName: string, filter, object, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
    return this.invokeProxy({ collectionName, operation: 'updateOne', args: [filter, object, options] });
  }

  async updateMany(collectionName: string, filter, object, options?: UpdateManyOptions): Promise<UpdateWriteOpResult> {
    return this.invokeProxy({ collectionName, operation: 'updateMany', args: [filter, object, options] });
  }

  async deleteOne(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    return this.invokeProxy({ collectionName, operation: 'deleteOne', args: [filter] });
  }

  async deleteMany(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    return this.invokeProxy({ collectionName, operation: 'deleteMany', args: [filter] });
  }

  async count(collectionName: string, filter, options?: MongoCountPreferences): Promise<number> {
    return this.invokeProxy({ collectionName, operation: 'count', args: [filter, options] });
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
