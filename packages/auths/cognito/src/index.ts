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
import { UserPoolsManager, CognitoSession } from './auth';
import { sessionModelTemplate, appUserPoolsManagerTemplate } from './templates';

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

export interface AwsJwt {
  header: {
    kid: string
    alg: string
  },
  payload: {
    iss: string
    email: string
    event_id: string
  }
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
        const decodedJwt = jwt.decode(token, { complete: true }) as AwsJwt;
        if (decodedJwt) {
          const kid = decodedJwt?.header?.kid;
          const appUserPoolsManager: UserPoolsManager = require(path.join(PathResolver.getDistPath, 'models', 'AppUserPoolsManager')).default;
          await appUserPoolsManager.init();
          const userPool = appUserPoolsManager.pools.find(pool => pool.iss === decodedJwt?.payload?.iss);
          if (userPool) {
            try {
              await new Promise((resolve, reject) => {
                jwt.verify(token, userPool.pems[kid], err => {
                  if (err) {
                    return reject(err);
                  } else {
                    return resolve();
                  }
                });
              });
              authResult.granted = true;
              authResult.principalId = decodedJwt.payload.event_id;
              const CognitoSession = require(path.join(PathResolver.getDistPath, 'models', 'CognitoSession')).default;
              const cognito = new CognitoSession();
              authResult.serializedSession = JSON.stringify({
                email: decodedJwt.payload.email,
              });
            } catch (e) {}
          }
        }
      }
    } catch {}

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
    const CognitoSession = require(path.join(PathResolver.getDistPath, 'models', 'CognitoSession')).default;
    return await CognitoSession.deserialize(session) as T;
  }
}

const Cognito = new CognitoAuthorizer();
export default Cognito;
export const authorizer = Cognito.authorizer;
export * from './auth';
