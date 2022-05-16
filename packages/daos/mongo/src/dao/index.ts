import {
  BulkWriteOptions,
  CreateIndexesOptions,
  DeleteOptions,
  DeleteResult,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertManyResult,
  InsertOneResult,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
} from "mongodb";
import Bson from "bson";
import { Lambda } from "aws-sdk";
import { JsonServices, JsonEnvs, PathResolver } from "@restlessness/core";
import path from "path";

interface ProxyRequest {
  collectionName: string;
  operation: string;
  args: any[];
}

interface ProxyResponse {
  responseBufferValues?: number[];
  error?: string;
  errorType?: string;
  errorMessage?: string;
}

class MongoDao {
  mongoProxy: Lambda;
  proxyFunctionName = "_serverless-mongo-proxy";

  constructor() {
    this.mongoProxy = new Lambda({});
  }

  private async invokeLocal(
    serializedRequest: string,
  ): Promise<Lambda.InvocationResponse> {
    const proxyPath = path.join(
      PathResolver.getNodeModulesPath,
      "serverless-mongo-proxy",
      "dist",
      "proxy",
    );
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
    const jsonEnvsEntry = await JsonEnvs.getEntryById(process.env["ENV_NAME"]);
    const stage =
      jsonEnvsEntry.type === "deploy"
        ? jsonEnvsEntry.stage
        : jsonEnvsEntry.type;
    return await this.mongoProxy
      .invoke({
        FunctionName: `${JsonServices.sharedService.service}-${stage}-${this.proxyFunctionName}`,
        InvocationType: "RequestResponse",
        Payload: serializedRequest,
      })
      .promise();
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
      if (process.env["IS_OFFLINE"]) {
        invocationResult = await this.invokeLocal(serializedRequest);
      } else {
        invocationResult = await this.invokeLambda(serializedRequest);
      }
    } catch (e) {
      throw new Error(`Error invoking mongodb proxy function, ${e}`);
    }

    const { StatusCode, Payload } = invocationResult;

    if (StatusCode !== 200) {
      throw new Error(
        `Error invoking mongodb proxy function, status code ${StatusCode}`,
      );
    }

    let response: ProxyResponse;
    try {
      response = JSON.parse(
        typeof Payload === "string" ? Payload : Payload.toString(),
      );
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
      return Bson.deserialize(Buffer.from(response.responseBufferValues))
        .result;
    } catch (e) {
      throw new Error(
        `Error on bson deserialize, ${e}, Request: ${JSON.stringify(
          request,
        )}, Response: ${JSON.stringify(response)}`,
      );
    }
  }

  async findOne<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    options?: FindOptions,
  ): Promise<Interface | null> {
    return this.invokeProxy({
      collectionName,
      operation: "findOne",
      args: [filter, options],
    });
  }

  async findMany<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    options?: FindOptions,
  ): Promise<Interface[]> {
    return this.invokeProxy({
      collectionName,
      operation: "find",
      args: [filter, options],
    });
  }

  async insertOne<Interface>(
    collectionName: string,
    document: Interface,
  ): Promise<Interface | null> {
    const result: InsertOneResult = await this.invokeProxy({
      collectionName,
      operation: "insertOne",
      args: [document],
    });
    if (result.insertedId) {
      return this.findOne<Interface>(collectionName, {
        _id: result.insertedId,
      } as unknown as Filter<Interface>);
    }
    return null;
  }

  async insertMany<Interface>(
    collectionName: string,
    documents: OptionalUnlessRequiredId<Interface>[],
    options: BulkWriteOptions,
  ): Promise<InsertManyResult<Interface>> {
    return this.invokeProxy({
      collectionName,
      operation: "insertMany",
      args: [documents, options],
    });
  }

  async updateOne<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    document: UpdateFilter<Interface> | Partial<Interface>,
    options?: UpdateOptions,
  ): Promise<UpdateResult> {
    return this.invokeProxy({
      collectionName,
      operation: "updateOne",
      args: [filter, document, options],
    });
  }

  async updateMany<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    document: UpdateFilter<Interface> | Partial<Interface>,
    options?: UpdateOptions,
  ): Promise<UpdateResult> {
    return this.invokeProxy({
      collectionName,
      operation: "updateMany",
      args: [filter, document, options],
    });
  }

  async deleteOne<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    options?: DeleteOptions,
  ): Promise<DeleteResult> {
    return this.invokeProxy({
      collectionName,
      operation: "deleteOne",
      args: [filter, options],
    });
  }

  async deleteMany<Interface>(
    collectionName: string,
    filter: Filter<Interface>,
    options?: DeleteOptions,
  ): Promise<DeleteResult> {
    return this.invokeProxy({
      collectionName,
      operation: "deleteMany",
      args: [filter, options],
    });
  }

  async createIndex(
    collectionName: string,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions,
  ): Promise<string> {
    return this.invokeProxy({
      collectionName,
      operation: "createIndex",
      args: [indexSpec, options],
    });
  }
}

const mongoDao = new MongoDao();

export default mongoDao;

export { MongoDao };
