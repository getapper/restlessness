import path from 'path';
import { JsonServerless, PathResolver } from '@restlessness/utilities';
import { Response } from '../ResponseHandler';
import { APIGatewayEventRequestContextWithAuthorizer, ClientContext, CognitoIdentity } from 'aws-lambda';
import EnvironmentHandler from '../EnvironmentHandler';

interface Event {
  http: {
    path: string,
    method: string,
    cors?: boolean,
    authorizer?: string
  }
}

interface EndPoint {
  handler: string,
  events: Event[]
}

interface TestAPIGatewayProxyEventBase<TAuthorizerContext> {
  headers?: { [name: string]: string };
  multiValueHeaders?: { [name: string]: string[] };
  isBase64Encoded?: boolean;
  multiValueQueryStringParameters?: { [name: string]: string[] } | null;
  stageVariables?: { [name: string]: string } | null;
  requestContext?: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext>;
  resource?: string;
}

interface TestContext {
  callbackWaitsForEmptyEventLoop?: boolean;
  functionName?: string;
  functionVersion?: string;
  invokedFunctionArn?: string;
  memoryLimitInMB?: string;
  awsRequestId?: string;
  logGroupName?: string;
  logStreamName?: string;
  identity?: CognitoIdentity;
  clientContext?: ClientContext;
  getRemainingTimeInMillis?(): number;
}

interface RequestData {
  payload?: { [name: string]: any } | null,
  queryStringParameters?: { [name: string]: string } | null,
  pathParameters?: { [name: string]: string } | null,
  headers?: { [name: string]: string },
}

type Lambda<TAuthorizerContext> = (
  event: AWSLambda.APIGatewayProxyEventBase<TAuthorizerContext>,
  context: AWSLambda.Context
) => Promise<Response>

export class TestHandler {
  static async beforeAll() {
    EnvironmentHandler.load();
  }

  static async afterAll() {}

  static async invokeLambda<TAuthorizerContext>(
    apiName: string,
    data?: RequestData,
    authorizer?: TAuthorizerContext,
    event?: TestAPIGatewayProxyEventBase<TAuthorizerContext>,
    context?: TestContext,
  ): Promise<Response> {
    const exporter = require(path.join(PathResolver.getDistPath, 'exporter.js'));
    const lambda: Lambda<TAuthorizerContext> = exporter[apiName];
    if (typeof lambda !== 'function') {
      throw new Error(`Wrong api name: ${apiName}. Supported api names: ${Object.keys(exporter)}`);
    }

    const endpoint = await JsonServerless.getEndpoint(apiName);

    let requestContext: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext> = null;
    if (authorizer) {
      requestContext = {
        accountId: null,
        apiId: null,
        authorizer,
        protocol: null,
        httpMethod: null,
        identity: null,
        path: null,
        stage: null,
        requestId: null,
        requestTime: null,
        requestTimeEpoch: null,
        resourceId: null,
        resourcePath: null,
      };
    };
    const eventOptions: AWSLambda.APIGatewayProxyEventBase<TAuthorizerContext> = Object.assign({
      body: null,
      headers: null,
      multiValueHeaders: null,
      httpMethod: endpoint.events[0].http.method,
      isBase64Encoded: false,
      path: endpoint.events[0].http.path,
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext,
      resource: null,
    }, event, {
      body: data?.payload ? JSON.stringify(data.payload) : undefined,
      pathParameters: data?.pathParameters,
      queryStringParameters: data?.queryStringParameters,
      headers: data?.headers,
    });

    const contextOptions: AWSLambda.Context = Object.assign({
      callbackWaitsForEmptyEventLoop: false,
      functionName: null,
      functionVersion: null,
      invokedFunctionArn: null,
      memoryLimitInMB: null,
      awsRequestId: null,
      logGroupName: null,
      logStreamName: null,
      fail(error: Error | string): void {},
      succeed(messageOrObject: any): void {},
      done(error?: Error, result?: any): void {},
      getRemainingTimeInMillis(): number {
        return 10000;
      },
    }, context);

    return lambda(eventOptions, contextOptions);
  }
};
