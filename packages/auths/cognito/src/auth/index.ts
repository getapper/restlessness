import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { promisify } from 'util';
import request from 'request';
import jwkToPem from 'jwk-to-pem';
import { ConfirmationCodeType } from 'aws-sdk/clients/cognitoidentityserviceprovider';

export default class UserPoolManager {
  clientId: string
  userPool: CognitoUserPool
  attributesList: string[]
  region: string
  pems: any
  iss: string
  cognitoIdentityServiceProvider: CognitoIdentityServiceProvider

  constructor (
    userPoolId: string,
    clientId: string,
    region: string,
    attributesList: string[],
  ) {
    this.userPool = new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    });
    this.clientId = clientId;
    this.attributesList = attributesList;
    this.region = region;
    this.iss = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.getUserPoolId()}`;
    this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-19', region });
  }

  async init () {
    return new Promise((resolve, reject) => {
      request({
        url : `${this.iss}/.well-known/jwks.json`,
        json : true,
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          // console.log(body);
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
        } else {
          reject(error);
        }
      });
    });
  }

  async signup (
    email: string,
    password: string,
    values: any,
  ) {
    const attributes: CognitoUserAttribute[] = this.attributesList.map(a => new CognitoUserAttribute(({
      Name: a,
      Value: values[a],
    })));

    const signupPromise = promisify(this.userPool.signUp.bind(this.userPool));
    const result = await signupPromise(email, password, attributes, null);
    return result.user;
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
}
