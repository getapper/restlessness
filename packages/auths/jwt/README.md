# @restlessness/auth-jwt [![npm version](https://img.shields.io/npm/v/@restlessness/auth-jwt.svg?style=flat)](https://www.npmjs.com/package/@restlessness/auth-jwt)

## Installation
From you restlessness project root run:

```shell script
$ # Install node package
$ npm i @restlessness/auth-jwt
$
$ # Add it to the project using the restlessness cli
$ restlessness add-auth @restlessness/auth-jwt
```

The `add-auth` command adds the package to the project and creates a `JwtSession` model class, representing the auth
session. The model class already includes convenience methods to *serialize* and *deserialize* the session object.

## Environment variables
| Name | Description |
-------|--------------
| RLN_AUTH_JWT_SECRET | Secret used to create/verify jwt tokens |

The `add-auth` command also adds parametric environment variables to the .env files present in the project.

Example **.env.production** file:
```
RLN_AUTH_JWT_SECRET=${RLN_AUTH_JWT_SECRET_PRODUCTION}
```
Then is possible to set the variable by setting `RLN_AUTH_JWT_SECRET_PRODUCTION` or setting
`RLN_AUTH_JWT_SECRET` directly.

## Usage
The `JwtSession` class created by the `add-auth` command can be modified to include the needed information
on the token.

Example:
```ts
// src/models/JwtSession/index.ts

export default class JwtSession {
  ['constructor']: typeof JwtSession
  id: string
  name: string
  permissions: string[]

  // ...
};
```

Then is possible to create a session:
```ts
// ...
const session = new JwtSession();
session.id = myId;
session.name = 'Arthur';
session.permissions = [];

const serialized = session.serialize();
const deserialized = JwtSession.deserialize(serialized);
// ...
```
