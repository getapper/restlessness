# @restlessness/auth-cognito [![npm version](https://img.shields.io/npm/v/@restlessness/auth-cognito.svg?style=flat)](https://www.npmjs.com/package/@restlessness/auth-cognito)

## Installation
From you restlessness project root run:

```shell script
$ # Install node package
$ npm i @restlessness/auth-cognito
$
$ # Add it to the project using the restlessness cli
$ restlessness add-auth @restlessness/auth-cognito
```

The `add-auth` command adds the package to the project and creates an `AppUserPoolsManager` model class.

## Environment variables
| Name | Description |
-------|--------------
| RLN_COGNITO_AUTH_USER_POOL_ID | user pool id |
| RLN_COGNITO_AUTH_USER_CLIENT_ID | user client id |
| RLN_COGNITO_AUTH_USER_REGION | user region |
| RLN_COGNITO_AUTH_USER_REDIRECT_URI | redirect uri |
| RLN_COGNITO_AUTH_ACCESS_KEY_ID | access key id |
| RLN_COGNITO_AUTH_SECRET_ACCESS_KEY | secret access key |

The `add-auth` command also adds parametric environment variables to the .env files present in the project.

Example **.env.production** file:
```
RLN_COGNITO_AUTH_USER_POOL_ID=${RLN_COGNITO_AUTH_USER_POOL_ID_PRODUCTION}
```
Then is possible to set the variable by setting `RLN_COGNITO_AUTH_USER_POOL_ID_PRODUCTION` or setting
`RLN_COGNITO_AUTH_USER_POOL_ID` directly.

## Usage
The `add-auth` command create a model class implementing the `UserPoolsManager` class.
With this model can be specified the list of pools.

Example:
```ts
// src/models/AppUserPoolsManager/index.ts

import { UserPoolsManager } from '@restlessness/auth-cognito';

class AppUserPoolsManager extends UserPoolsManager {
  get poolInfos() {
    return [
      {
        id: 'user',
        attributes: [],
      },
      {
        id: 'my-id',
        attributes: [ 'my' , 'list', 'of', 'attributes' ],
      },
    ];
  }
};

export default new AppUserPoolsManager();
```

All convenience methods of the `UserPoolsManager` can be accessed from the extended class:
```ts
import userPoolsManager from '../models/AppUserPoolsManager';
// ...
console.log(userPoolsManager.poolInfos)
const userSession = await userPoolsManager.login('sample@email.com', 'sample_password');
// ...
``` 

## Hooks
The package uses the `beforeEndpoint`
[hook](https://www.github.com/getapper/restlessness/packages/restlessness-core) to
initialize the user pool manager (`AppUserPoolsManager`).

## Documentation

### <a name="userpoolsmanager"></a> UserPoolsManager `class`

###### Fields:
- `pools: UserPoolManager[]`\
    A list of user pool manager

###### Methods:
- `abstract get poolInfos(): PoolInfo[]`\
    Implement this method to specify the user pools\
    **Returns**: [PoolInfo](#PoolInfo) - the list of pools to be managed

- `init(): Promise<void>`\
    Initialize all the pool managers (field `pools`) specified by the `poolInfos` method\
    **Returns**: the MongoDao object used to perform all the query

- `getUserPoolById(id: string): UserPoolManager`\
    **id**: the id of the manager to be returned\
    **Returns**: the user pool manager identified by the specified id

### <a name="userpoolmanager"></a> UserPoolManager `object`

###### Methods:
- `signup(email: string, password: string, values: any): Promise<CognitoSignUpResult>`\
    **Returns**: signup result

- `login(email: string, password: string): Promise<CognitoUserSession>`\
    **Returns**: user session

- `getOAuth2TokensFromCode(code: string): Promise<CognitoTokens>`\
    **Returns**: [CognitoTokens](#CognitoTokens) - the tokens object

- `recoveryPassword(email: string): Promise<any>`

- `resetPassword(email: string, verificationCode: string, newPassword: string): Promise<any>`

- `confirmAccount(username: string, code: ConfirmationCodeType): Promise<void>`

- `refreshTokens(idToken: string, refreshToken: string): Promise<CognitoUserSession>`

- `adminUpdateAttributes(email: string, attributes: object): Promise<void>`

- `adminCreateUser(email: string, password: string, attributes?: AttributeListType): Promise<any>`

- `verifyMFA(cognitoUserSession: CognitoUserSession, username: string, verificationCode: string): Promise<CognitoUserSession>`\
    **Returns**: user session

- `changePassword(email: string, oldPassword: string, newPassword: string): Promise<void>`

- `adminChangeUserPassword(email: string, newPassword: string): Promise<void>`

- `adminGetUser(username: UsernameType)`

### Types

#### PoolInfo
```ts
interface PoolInfo {
  id: string
  attributes: string[]
}
```

#### CognitoTokens
```ts
interface CognitoTokens {
  idToken: string
  accessToken: string
  refreshToken: string
}
```

