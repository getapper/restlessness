import {
  LambdaAuthorizerHandler,
  AuthorizerPackage,
  AuthorizerEvent,
  JsonAuthorizers,
  AuthorizerResult,
  JsonAuthorizersEntry,
  JsonModels,
  EnvFile,
  PathResolver,
} from '@restlessness/core';
import AWSLambda from 'aws-lambda';
import jwt from 'jsonwebtoken';
import path from 'path';
import UserPoolManager from './auth';
import { jwtSessionModelTemplate } from './templates';

interface JwtSessionData {
  id: string,
  serializedSession: string,
}

export interface SessionModelInterface<T> {
  deserialize: (string) => Promise<T>
}

export interface SessionModelInstance {
  id: string,
  serialize: () => Promise<string>,
}

class CognitoAuthorizer extends AuthorizerPackage {
  constructor() {
    super();
    this.authorizer = this.authorizer.bind(this);
    this.checkSession = this.checkSession.bind(this);
  }

  get authorizerPath() {
    return path.join('dist', 'index.authorizer');
  }

  async postInstall(): Promise<void> {
    const jsonAuthorizer: JsonAuthorizersEntry = {
      id: 'cognito',
      name: 'AWS Cognito',
      package: '@restlessness/auth-cognito',
      sessionModelName: 'CognitoSession',
    };
    if (await JsonAuthorizers.getEntryById(jsonAuthorizer.id)) {
      console.warn(`${jsonAuthorizer.id} Auth already found inside authorizers.json!`);
    }
    await JsonAuthorizers.addEntry(jsonAuthorizer);
    await JsonModels.create('JwtSession', null, jwtSessionModelTemplate());
  }

  async beforeLambda<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    // @TODO: Put AWS secrets
    await envFile.setParametricValue('RLN_AUTH_JWT_SECRET');
  }

  async checkSession(event: AuthorizerEvent): Promise<AuthorizerResult> {
    const authResult: AuthorizerResult = {
      granted: false,
    };

    try {
      const token = event?.authorizationToken?.split(' ')?.[1] ?? null;
      if (token !== null) {
        const jwtSecret = process.env['RLN_AUTH_JWT_SECRET'];
        const jwtUnsigned: any = jwt.verify(token, jwtSecret);
        if (jwtUnsigned.serializedSession && jwtUnsigned.id) {
          const jwtSessionData: JwtSessionData = {
            id: jwtUnsigned.id,
            serializedSession: jwtUnsigned.serializedSession,
          };
          authResult.granted = true;
          authResult.principalId = jwtSessionData.id;
          authResult.serializedSession = jwtSessionData.serializedSession;
        }
      }
    } catch {
      authResult.granted = false;
    }

    return authResult;
  }

  async createToken(session: SessionModelInstance): Promise<string> {
    const jwtSecret = process.env['RLN_AUTH_JWT_SECRET'];
    const sessionString = await session.serialize();
    return jwt.sign({
      id: session.id,
      serializedSession: sessionString,
    }, jwtSecret);
  }

  async authorizer(event: AuthorizerEvent) {
    return LambdaAuthorizerHandler(event, this.checkSession);
  }

  async parseSession<T>(session: string): Promise<T> {
    const JwtSession = require(path.join(PathResolver.getDistPath, 'models', 'JwtSession')).default;
    return await JwtSession.deserialize(session) as T;
  }
}

const Cognito = new CognitoAuthorizer();
export default Cognito;
export const authorizer = Cognito.authorizer;
export { UserPoolManager };
