import {
  AuthorizerPackage,
  AuthorizerEvent,
  JsonAuthorizers,
  AuthorizerResult,
  JsonAuthorizersEntry,
  JsonModels,
  EnvFile,
  PathResolver,
  JsonEnvs,
  SessionModelInstance,
  SessionModelInterface,
} from '@restlessness/core';
import AWSLambda from 'aws-lambda';
import jwt from 'jsonwebtoken';
import path from 'path';
import { UserPoolsManager } from './auth';
import { sessionModelTemplate, appUserPoolsManagerTemplate } from './templates';

interface JwtSessionData {
  id: string,
  serializedSession: string,
}

class CognitoAuthorizer extends AuthorizerPackage {
  constructor() {
    super();
    this.authorizer = this.authorizer.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
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
    await JsonModels.create('CognitoSession', null, sessionModelTemplate());
    await JsonModels.create('AppUserPoolsManager', null, appUserPoolsManagerTemplate());
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(async jsonEnvsEntry => {
      const envFile = new EnvFile(jsonEnvsEntry.id);
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_POOL_ID');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_CLIENT_ID');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_REGION');
    }));
  }

  async beforeLambda<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {
    const appUserPoolsManager: UserPoolsManager = require(path.join(PathResolver.getDistPath, 'models', 'AppUserPoolsManager')).default;
    await appUserPoolsManager.init();
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    // @TODO: Put AWS secrets
    await envFile.setParametricValue('RLN_AUTH_JWT_SECRET');
  }

  async verifyToken(event: AuthorizerEvent): Promise<AuthorizerResult> {
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

  async parseSession<T extends SessionModelInterface<SessionModelInstance>>(session: string): Promise<T> {
    const JwtSession = require(path.join(PathResolver.getDistPath, 'models', 'JwtSession')).default;
    return await JwtSession.deserialize(session) as T;
  }
}

const Cognito = new CognitoAuthorizer();
export default Cognito;
export const authorizer = Cognito.authorizer;
export * from './auth';
