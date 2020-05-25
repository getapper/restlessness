import path from 'path';
import { Response } from '../response-handler';
import { APIGatewayEventRequestContextWithAuthorizer, ClientContext, CognitoIdentity } from 'aws-lambda';

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
  body?: string | null;
  headers?: { [name: string]: string };
  multiValueHeaders?: { [name: string]: string[] };
  isBase64Encoded?: boolean;
  pathParameters?: { [name: string]: string } | null;
  queryStringParameters?: { [name: string]: string } | null;
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

type Lambda<TAuthorizerContext> = (
  event: AWSLambda.APIGatewayProxyEventBase<TAuthorizerContext>,
  context: AWSLambda.Context
) => Promise<Response>

const apiCall = async<TAuthorizerContext>(
  apiName: string,
  event?: TestAPIGatewayProxyEventBase<TAuthorizerContext>,
  context?: TestContext,
): Promise<Response> => {
  const exporter = require(path.join(process.cwd(), 'dist', 'exporter.js'));
  const lambda: Lambda<TAuthorizerContext> = exporter[apiName];
  if (typeof lambda !== 'function') {
    throw new Error(`Wrong api name: ${apiName}. Supported api names: ${Object.keys(exporter)}`);
  }

  const jsonFunctions = require(path.join(process.cwd(), 'functions.json'));
  const endpoint: EndPoint = jsonFunctions.functions[apiName];

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
    requestContext: null,
    resource: null,
  }, event);

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
};

export {
  apiCall,
};
