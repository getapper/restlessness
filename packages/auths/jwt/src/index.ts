import {
  AuthorizerEvent,
  AuthorizerPackage,
  AuthorizerResult,
  EnvFile,
  JsonAuthorizers,
  JsonAuthorizersEntry,
  JsonModels,
  PathResolver,
  SessionModelInstance,
  SessionModelInterface,
} from '@restlessness/core';
import AWSLambda from 'aws-lambda';
import jwt from 'jsonwebtoken';
import path from 'path';
import { jwtSessionModelTemplate } from './templates';

interface JwtSessionData {
  id: string,
  serializedSession: string,
}

class JwtAuthorizer extends AuthorizerPackage {
  constructor() {
    super();
    this.authorizer = this.authorizer.bind(this);
  }

  async postInstall(): Promise<void> {
    const jsonAuthorizer: JsonAuthorizersEntry = {
      id: 'jwt',
      name: 'JWT',
      package: '@restlessness/auth-jwt',
      sessionModelName: 'JwtSession',
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
    await envFile.setParametricValue('RLN_AUTH_JWT_SECRET');
  }

  async createToken(session: SessionModelInstance): Promise<string> {
    const jwtSecret = process.env['RLN_AUTH_JWT_SECRET'];
    const sessionString = await session.serialize();
    return jwt.sign({
      id: session.id,
      serializedSession: sessionString,
    }, jwtSecret);
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

  async parseSession<T extends SessionModelInterface<SessionModelInstance>>(session: string): Promise<T> {
    const JwtSession = require(path.join(PathResolver.getDistPath, 'models', 'JwtSession')).default;
    return await JwtSession.deserialize(session) as T;
  }
}

const Jwt = new JwtAuthorizer();
export default Jwt;
export const authorizer = Jwt.authorizer;
