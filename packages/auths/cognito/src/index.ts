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
  JsonServices,
} from '@restlessness/core';
import AWSLambda from 'aws-lambda';
import jwt from 'jsonwebtoken';
import path from 'path';
import { UserPoolsManager, CognitoSession, AwsJwt } from './auth';
import { appUserPoolsManagerTemplate } from './templates';

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
      shared: true,
    };
    if (await JsonAuthorizers.getEntryById(jsonAuthorizer.id)) {
      console.warn(`${jsonAuthorizer.id} Auth already found inside authorizers.json!`);
    }
    await JsonAuthorizers.addEntry(jsonAuthorizer);
    await JsonModels.create('AppUserPoolsManager', null, appUserPoolsManagerTemplate());
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(async jsonEnvsEntry => {
      const envFile = new EnvFile(jsonEnvsEntry.id);
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_POOL_ID');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_CLIENT_ID');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_REGION');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_REDIRECT_URI');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_ACCESS_KEY_ID');
      await envFile.setParametricValue('RLN_COGNITO_AUTH_SECRET_ACCESS_KEY');
    }));

    await JsonServices.read();
    await JsonServices.createCustomAuthorizerForSharedService(jsonAuthorizer.id);
    await JsonServices.save();
  }

  async beforeLambda<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {
    if (process.env['ENV_NAME'] !== 'test') {
      const appUserPoolsManager: UserPoolsManager = require(path.join(PathResolver.getDistPath, 'models', 'AppUserPoolsManager')).default;
      await appUserPoolsManager.init();
    }
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_POOL_ID');
    await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_CLIENT_ID');
    await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_REGION');
    await envFile.setParametricValue('RLN_COGNITO_AUTH_USER_REDIRECT_URI');
    await envFile.setParametricValue('RLN_COGNITO_AUTH_ACCESS_KEY_ID');
    await envFile.setParametricValue('RLN_COGNITO_AUTH_SECRET_ACCESS_KEY');
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
              authResult.principalId = decodedJwt?.payload?.event_id ?? decodedJwt?.payload?.sub;
              const cognito = new CognitoSession();
              Object.assign(cognito, decodedJwt.payload);
              cognito.id = authResult.principalId;
              authResult.serializedSession = await cognito.serialize();
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    } catch(e) {
      console.log(e);
    }

    return authResult;
  }

  async createToken(session: SessionModelInstance): Promise<string> {
    return '';
  }

  async parseSession(session: string) {
    return CognitoSession.deserialize(session);
  }

  getSessionModelName(): string {
    return 'CognitoSession';
  }

  getSessionModelImport(): string {
    return 'import { CognitoSession } from \'@restlessness/auth-cognito\';';
  }
}

const Cognito = new CognitoAuthorizer();
export default Cognito;
export const authorizer = Cognito.authorizer;
export * from './auth';
