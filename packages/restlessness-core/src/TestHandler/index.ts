import path from 'path';
import {
  JsonServerless,
  PathResolver,
  JsonEndpoints,
  AuthorizerPackage,
  JsonAuthorizers,
  SessionModelInstance,
  Response,
} from '../';
import { APIGatewayEventRequestContextWithAuthorizer, ClientContext, CognitoIdentity } from 'aws-lambda';
import EnvironmentHandler from '../EnvironmentHandler';
import AWSLambda from 'aws-lambda';

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
    session?: SessionModelInstance,
    event?: TestAPIGatewayProxyEventBase<TAuthorizerContext>,
    context?: TestContext,
  ): Promise<Response> {
    const exporter = require(path.join(PathResolver.getDistPath, 'exporter.js'));
    const lambda: Lambda<TAuthorizerContext> = exporter[apiName];
    if (typeof lambda !== 'function') {
      throw new Error(`Wrong api name: ${apiName}. Supported api names: ${Object.keys(exporter)}`);
    }

    const endpoint = await JsonServerless.getEndpoint(apiName);
    const jsonEndpoint = await JsonEndpoints.getEntryById(apiName);

    let requestContext: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext> = null;
    if (authorizer || jsonEndpoint.authorizerId) {
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

      if (jsonEndpoint.authorizerId) {
        const jsonAuthorizer = await JsonAuthorizers.getEntryById(jsonEndpoint.authorizerId);
        const authPackage: AuthorizerPackage = AuthorizerPackage.load(jsonAuthorizer.package);
        let authResult;
        try {
          const authToken = await authPackage.createToken(session);
          authResult = await authPackage.authorizer({
            type: 'TOKEN',
            authorizationToken: `Bearer ${authToken}`,
            methodArn: `arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/${jsonEndpoint.method.toUpperCase()}/${jsonEndpoint.route}`,
          });
        } catch(e) {
          throw new Error(`Authorizer ${jsonEndpoint.authorizerId}\n${e}`);
        }
        if (authResult === 'Unauthorized') {
          throw new Error('Unauthorized');
        }

        requestContext.authorizer = {
          ...(requestContext.authorizer || {}),
          ...authResult.context,
        };
      }
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
