import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
  ISignUpResult,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { promisify } from 'util';
import request from 'request';
import jwkToPem from 'jwk-to-pem';
import {
  AttributeListType,
  ConfirmationCodeType,
  UsernameType,
  UserPoolIdType,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import fetch from 'cross-fetch';
import jwt from 'jsonwebtoken';

export interface CognitoSignUpResult extends ISignUpResult {};
export { CognitoUserSession, CognitoUser, CognitoIdentityServiceProvider };

export interface AwsJwt {
  header: {
    kid: string
    alg: string
  },
  payload: {
    sub: string
    iss: string
    email: string
    event_id: string
  }
}

export interface CognitoUserCustom extends CognitoUser {
  Session?: CognitoUserSession
}

export interface CognitoTokens {
  idToken: string
  accessToken: string
  refreshToken: string
}

export class UserPoolManager {
  id: string
  clientId: string
  authDomain: string
  redirectUri: string
  userPool: CognitoUserPool
  attributesList: string[]
  region: string
  pems: any
  iss: string
  cognitoIdentityServiceProvider: CognitoIdentityServiceProvider

  constructor (
    id: string,
    userPoolId: string,
    clientId: string,
    authDomain: string,
    redirectUri: string,
    region: string,
    attributesList: string[],
    accessKeyId?,
    secretAccessKey?,
  ) {
    this.id = id;
    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    });
    this.clientId = clientId;
    this.authDomain = authDomain;
    this.redirectUri = redirectUri;
    this.attributesList = attributesList;
    this.region = region;
    this.iss = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.getUserPoolId()}`;
    this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19', region, accessKeyId, secretAccessKey });
  }

  async init () {
    global['fetch'] = fetch;
    return new Promise((resolve, reject) => {
      request({
        url : `${this.iss}/.well-known/jwks.json`,
        json : true,
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(new Error('Fetching pool jwks error: ' + JSON.stringify(response?.body)));
        }
        this.pems = {};
        const keys = body['keys'];
        for (let i = 0; i < keys.length; i++) {
          const key_id = keys[i].kid;
          const modulus = keys[i].n;
          const exponent = keys[i].e;
          const key_type = keys[i].kty;
          const jwk = { kty: key_type, n: modulus, e: exponent };
          const pem = jwkToPem(jwk);
          this.pems[key_id] = pem;
        }
        resolve();
      });
    });
  }

  async signup (
    email: string,
    password: string,
    values: any,
  ): Promise<CognitoSignUpResult> {
    const attributes: CognitoUserAttribute[] = this.attributesList.map(a => new CognitoUserAttribute(({
      Name: a,
      Value: values[a],
    })));

    const signupPromise = promisify(this.userPool.signUp.bind(this.userPool));
    return signupPromise(email, password, attributes, null);;
  }

  async login (
    email: string,
    password: string,
  ): Promise<CognitoUserSession> {
    const authenticationDetails: AuthenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser: CognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: () => {
          cognitoUser.completeNewPasswordChallenge(password, [], {
            onSuccess: resolve,
            onFailure: reject,
          });
        },
        mfaRequired () {
          const e = new Error('MFA required to authenticate');
          e['code'] = 'MFARequired';
          e['session'] = cognitoUser['Session'];
          reject(e);
          // resolve(cognitoUser);
        },
      });
    });
  }

  async getOAuth2TokensFromCode (
    code: string,
  ): Promise<CognitoTokens> {
    return new Promise((resolve, reject) => {
      request({
        url: `https://${this.authDomain}/oauth2/token`,
        method: 'POST',
        form: {
          grant_type: 'authorization_code',
          code,
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
        },
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          return reject(new Error('Getting oAuth2 tokens error: ' + JSON.stringify(response?.body)));
        }
        const jsonBody = JSON.parse(body);

        resolve({
          idToken: jsonBody.id_token,
          accessToken: jsonBody.access_token,
          refreshToken: jsonBody.refresh_token,
        });
      });
    });
  }

  async recoveryPassword (
    email: string,
  ) {

    const cognitoUser: CognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return await new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  async resetPassword (
    email: string,
    verificationCode: string,
    newPassword: string,
  ) {

    const cognitoUser: CognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });

    return await new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(verificationCode, newPassword, {
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  async confirmAccount (username: string, code: ConfirmationCodeType) {
    const params = {
      ClientId: this.clientId,
      ConfirmationCode: code,
      Username: username,
    };

    const confirmSignUp = this.cognitoIdentityServiceProvider.confirmSignUp(params);
    const result = await confirmSignUp.promise();
  }

  async refreshTokens (idToken: string, refreshToken: string): Promise<CognitoUserSession> {
    const decodedJwt = jwt.decode(idToken, { complete: true }) as AwsJwt;
    if (decodedJwt) {
      const { email } = decodedJwt.payload;

      const cognitoUser: CognitoUser = new CognitoUser({
        Username: email,
        Pool: this.userPool,
      });

      const cognitoRefreshToken = new CognitoRefreshToken({
        RefreshToken: refreshToken,
      });

      return new Promise((resolve, reject) => {
        cognitoUser.refreshSession(cognitoRefreshToken, (err, session: CognitoUserSession) => {
          if (err) {
            return reject(err);
          }
          resolve(session);
        });
      });
    } else {
      throw new Error('Invalid session token');
    }
  }

  async adminUpdateAttributes (email: string, attributes: object): Promise<any> {
    const attributesList = Object.keys(attributes).map((key) => ({
      Name: key,
      Value: attributes[key],
    }));

    const params = {
      Username: email,
      UserPoolId: this.userPool.getUserPoolId(),
      UserAttributes: attributesList,
    };
    const adminUpdateUserAttributes = this.cognitoIdentityServiceProvider.adminUpdateUserAttributes(params);
    const result = await adminUpdateUserAttributes.promise();
  }

  async adminCreateUser (email: string, password: string, attributes?: AttributeListType): Promise<any> {
    const result = await (this.cognitoIdentityServiceProvider.adminCreateUser({
      UserPoolId: this.userPool.getUserPoolId(),
      Username: email,
      TemporaryPassword: password,
      UserAttributes: attributes,
    }).promise());

    return result;
  }

  async verifyMFA (cognitoUserSession: CognitoUserSession, username: string, verificationCode: string): Promise<any> {
    return await new Promise((resolve, reject) => {
      const cognitoUser: CognitoUserCustom = new CognitoUser({
        Username: username,
        Pool: this.userPool,
      });
      cognitoUser.Session = cognitoUserSession;
      cognitoUser.sendMFACode(verificationCode, {
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  async changePassword (
    email: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    //@TODO: not working, user unauthorized, to be fixed
    const cognitoUser: CognitoUser = new CognitoUser({
      Username: email,
      Pool: this.userPool,
    });
    await new Promise((resolve, reject) => {
      this.userPool.getCurrentUser().getSession((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    return await new Promise((resolve, reject) => {
      this.userPool.getCurrentUser().changePassword(oldPassword, newPassword, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  async adminChangeUserPassword (
    email: string,
    newPassword: string,
  ): Promise<void> {
    const params = {
      Username: email,
      UserPoolId: this.userPool.getUserPoolId(),
      Password: newPassword,
      Permanent: true,
    };
    const adminUpdateUserAttributes = this.cognitoIdentityServiceProvider.adminSetUserPassword(params);
    await adminUpdateUserAttributes.promise();
  }

  async adminGetUser(username: UsernameType) {
    return await this.cognitoIdentityServiceProvider.adminGetUser({
      UserPoolId: this.userPool.getUserPoolId(),
      Username: username,
    }).promise();
  }
}

export interface PoolInfo {
  id: string
  attributes: string[]
}

export class CognitoSession {
  ['constructor']: typeof CognitoSession
  id: string
  email: string
  sub: string
  username: string

  async serialize(): Promise<string> {
    return JSON.stringify(this);
  }

  static async deserialize(session: string): Promise<CognitoSession> {
    const jwtSession = new CognitoSession();
    Object.assign(jwtSession, JSON.parse(session));
    return jwtSession;
  }
};

export abstract class UserPoolsManager {
  pools: UserPoolManager[]

  abstract get poolInfos(): PoolInfo[];

  async init() {
    try {
      this.pools = this.poolInfos.map(poolInfo => new UserPoolManager(
        poolInfo.id,
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_POOL_ID`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_CLIENT_ID`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_AUTH_DOMAIN`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_REDIRECT_URI`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_REGION`],
        poolInfo.attributes,
        process.env['RLN_COGNITO_AUTH_ACCESS_KEY_ID'],
        process.env['RLN_COGNITO_AUTH_SECRET_ACCESS_KEY'],
      ));
      return Promise.all(this.pools.map(async pool => await pool.init()));
    } catch (e) {
      console.error('MISSING COGNITO ENV OR INFOS!', this.poolInfos.map(poolInfo => ([
        poolInfo.id,
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_POOL_ID`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_CLIENT_ID`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_AUTH_DOMAIN`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_REDIRECT_URI`],
        process.env[`RLN_COGNITO_AUTH_${poolInfo.id.toUpperCase()}_REGION`],
        poolInfo.attributes,
        process.env['RLN_COGNITO_AUTH_ACCESS_KEY_ID'],
        process.env['RLN_COGNITO_AUTH_SECRET_ACCESS_KEY'],
      ])));
      throw e;
    }
  }

  getUserPoolById(id: string) {
    return this.pools.find(pool => pool.id === id);
  }
}
