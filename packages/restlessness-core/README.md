# @restlessness/core [![npm version](https://img.shields.io/npm/v/@restlessness/core.svg?style=flat)](https://www.npmjs.com/package/@restlessness/core)

Core package for the [restlessness](https://www.github.com/getapper/restlessness) framework

## Documentation

### Classes:
- [AddOnPackage](#AddOnPackage)
- [AuthorizerPackage](#AuthorizerPackage)
- [DaoPackage](#DaoPackage)
- [EnvFile](#EnvFile)
- [EnvironmentHandler](#EnvironmentHandler)
- [JsonAuthorizers](#JsonAuthorizers)
- [JsonConfigFile](#JsonConfigFile)
- [JsonDaos](#JsonDaos)
- [JsonEndpoints](#JsonEndpoints)
- [JsonEnvs](#JsonEnvs)
- [JsonModels](#JsonModels)
- [JsonSchedules](#JsonSchedules)
- [PackageJson](#PackageJson)
- [PathResolver](#PathResolver)
- [ResponseHandler](#ResponseHandler)

### AddOnPackage
Base class for Addon packages. It defines project's lifecycle hooks.

#### Methods
- `static load<T>(packageName: string): T`\
    Require _packageName_ from the project's node_modules folder\
    **Returns**: the loaded package

- `abstract postInstall(): Promise<void>`\
    Post install hook.
    The [CLI](https://github.com/getapper/restlessness/tree/master/packages/restlessness-cli)
    commands `add-auth` and `add-dao` execute this method. Use it to add the addon to the
    project and to perform initialization operations (for example it is possible to add required
    environment variables to the existing environment).

- `abstract postEnvCreated(envName: string): Promise<void>`\
    Post environment created hook.
    Called after a new environment has been created. Use it to define environment variables needed
    by the addon.

- `abstract beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void>`\
    Before endpoint hook.
    Called before executing the endpoint handler. It receives the handler's parameters, _event_ and
    _context_ objects, see [@types/aws-lambda](https://www.npmjs.com/package/aws-lambda) for
    details. 

- `abstract beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context): Promise<void>`\
    Before schedule hook.
    Called before executing the schedule handler. It receives the schedule's parameters, _event_ and
    _context_ objects, see [@types/aws-lambda](https://www.npmjs.com/package/aws-lambda) for
    details.

###### Example
These Addon packages provided by Restlessness can be taken as example:
- [@restlessness/auth-cognito](https://github.com/getapper/restlessness/tree/master/packages/auths/cognito)
- [@restlessness/auth-jwt](https://github.com/getapper/restlessness/tree/master/packages/auths/jwt)
- [@restlessness/dao-mongo](https://github.com/getapper/restlessness/tree/master/packages/daos/mongo)

### AuthorizerPackage
Base class for Authorizer Addons, extension of [AddOnPackage](#AddOnPackage).

#### Methods
- `abstract createToken(session: SessionModelInstance): Promise<string>`\
    **session**: the session to be embedded into the token\
    **Returns**: the token string

- `abstract verifyToken(event: AuthorizerEvent): Promise<AuthorizerResult>`\
    Grant or refuses authorization based on the token contained in the event\
    **event**: [AuthorizerEvent](#AuthorizerEvent)\
    **Returns**: an [AuthorizerResult](#AuthorizerResult) 

- `abstract parseSession(session: string): Promise<unknown>`\
    **session**: the serialized session\
    **Return**: the deserialized session object

- `abstract getSessionModelName(): string`\
    **Returns**: the name of the exported model class

- `abstract getSessionModelImport(): string`\
    **Returns**: import statement string to import the exported model class

- `async authorizer(event: AuthorizerEvent): Promise<AuthPolicyResponse>`\
    The function entry point that will be exported and used by lambda functions.
    It verifies the request token and returns the auth policy accordingly\
    **event**: [AuthorizerEvent](#AuthorizerEvent)\
    **Returns**: [AuthPolicyResponse](#AuthPolicyResponse)

- `generatePolicy(event: AuthorizerEvent, authResult: AuthorizerResult): AuthPolicyResponse`\
    Generate an auth policy based on the event, and the auth result.\
    **event**: [AuthorizerEvent](#AuthorizerEvent)\
    **Returns**: [AuthPolicyResponse](#AuthPolicyResponse)

#### Types

##### AuthorizerEvent
see [aws doc](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html)
for details
```ts
interface AuthorizerEvent {
  headers?: { [key: string]: string },
  pathParameters?: { [name: string]: string } | null,
  queryStringParameters?: { [name: string]: string } | null,
  authorizationToken?: string,
  methodArn?: string,
  type: 'TOKEN' | 'REQUEST'
}
```

##### AuthorizerResult
```ts
interface AuthorizerResult {
  granted: boolean,
  serializedSession?: string,
  principalId?: string,
}
```

##### AuthPolicyResponse
```ts
interface AuthPolicyResponse {
  principalId: string,
  policyDocument: any,
  context?: any,
}
```

###### Example
- [@restlessness/auth-cognito](https://github.com/getapper/restlessness/tree/master/packages/auths/cognito)
- [@restlessness/auth-jwt](https://github.com/getapper/restlessness/tree/master/packages/auths/jwt)

### DaoPackage
Base class for Data Access Object Addons, extension of [AddOnPackage](#AddOnPackage).

#### Methods
- `abstract modelTemplate(modelName: string): string`\
    **modelName**: name of the model to be created\
    **Returns**: the code template for the model

### EnvFile
Class to manage environment files.

#### Methods
- `constructor(envName: string)`\
    **envName**: name of the environment to manage

- `getValue(key: string): Promise<string>`\
    **Returns**: the env value corresponding to _key_

- `setValue(key: string, value: string, overwrite: boolean = false): Promise<void>`\
    Set _value_ for _key_\
    **overwrite**: replace the value if it already exists

- `setParametricValue(key: string): Promise<void>`\
    Set a key as parametric, based on the environment name.\
    The generated entry is `key=${key_ENVNAME}`

- `expand(): Promise<ENV>`\
    **Returns**: the environment object with parametric values expanded

- `generate(): Promise<void>`\
    Generate the **.env** file in the project root, with parametric values expanded

### EnvironmentHandler
Load environment variables once.

#### Methods
- `load(): void`\
    Load **.env** file into `process.env`, if the `RLN_ENVIRONMENT_LOADED` variable
    isn't set, and update it accordingly. 

### JsonAuthorizers
Implementation of [JsonConfigFile](#JsonConfigFile) for authorizers config file.

#### Types

##### JsonAuthorizersEntry
```ts
interface JsonAuthorizersEntry extends JsonConfigEntry {
  name: string
  package: string     // corresponding package under node_modules folder
  shared: boolean     // shared, can be used across services if true
  importKey?: string  // key for importing the authorizer from other services
}
```

### JsonConfigFile
Base abstract class to handle json configuration files, composed by list of entries.

#### Fields
- `entries: T[]`\
    List of configuration entries

#### Methods
- `abstract get jsonPath(): string`\
    **Returns**: the path of the configuration file

- `read(): Promise<void>`\
    Read the configuration file and save it into the `entries` field

- `write(): Promise<void>`\
    Save the list of entries into the file specified by the `jsonPath` getter

- `getEntryById(id: string): Promise<T>`\
    **Returns**: the corresponding entry or `null`

- `addEntry(entry: T): Promise<void>`\
    Add _entry_ to the list of entries, throw an error if the entry already exists

- `removeEntryById(id: string): Promise<void>`\
    Remove the corresponding entry

- `updateEntry(entry: T): Promise<void>`\
    Update the entry, throw an error if an entry with that id does not exist 

    

#### Types

##### JsonConfigEntry
```ts
interface JsonConfigEntry {
  id: string
}
```

### JsonDaos
Implementation of [JsonConfigFile](#JsonConfigFile) for data access objects config file.

#### Types

##### JsonDaosEntry
```ts
interface JsonDaosEntry extends JsonConfigEntry {
  name: string
  package: string
}
```

### JsonEndpoints
Implementation of [JsonConfigFile](#JsonConfigFile) for endpoints config file.

#### Methods
- `create(endpoint: {
    routePath: string,
    method: HttpMethod,
    authorizerId?: string,
    daoIds?: string[],
    warmupEnabled?: boolean,
    serviceName: string
  }): Promise<JsonEndpointsEntry>`\
  Creates an endpoint entry, file templates (handler, validation and test).
  Creates the associated lambda function on the corresponding serverless service file.

#### Types

##### JsonEndpointsEntry
```ts
interface JsonEndpointsEntry extends JsonConfigEntry {
  route: string
  safeFunctionName: string
  description?: string
  method: HttpMethod
  authorizerId?: string
  daoIds?: string[]
  warmupEnabled: boolean
  serviceName: string
}
```

##### enum HttpMethod {
```ts
enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
  PATCH = 'patch'
}
```

### JsonEnvs
Implementation of [JsonConfigFile](#JsonConfigFile) for environments config file.

#### Methods
- `create(id: string): Promise<JsonEnvsEntry>`\
    Creates the environment and execute the *postEnvCreated* hook

#### Types

##### JsonEnvsEntry
```ts
interface JsonEnvsEntry extends JsonConfigEntry {
  type: EnvType
  stage?: EnvStage
}
```

### JsonModels
Implementation of [JsonConfigFile](#JsonConfigFile) for models config file.

#### Methods
- `create(id: string, daoId?: string, template?: string): Promise<JsonModelsEntry>`\
    Creates a new model entry, and creates a file template for the model
    **id**: model's id\
    **daoId**: associated data access object, if specified its model template will be used\
    **template**: use a custom model template

#### Types

##### JsonModelsEntry
```ts
interface JsonModelsEntry extends JsonConfigEntry {
  daoId?: string
}
```

### JsonSchedules
Implementation of [JsonConfigFile](#JsonConfigFile) for schedules config file.

#### Methods
- `createSchedule(event: Event): Promise<JsonSchedulesEntry>`\
    Creates a schedule event function, see
    [serverless doc](https://www.serverless.com/framework/docs/providers/aws/events/schedule/)
    for details.

#### Types

##### Event
```ts
interface Event {
    name: string
    description?: string
    rateNumber: number
    rateUnit: RateUnit
    enabled?: boolean
    serviceName: string
    input?: {
      type: 'input' | 'inputPath' | 'inputTransformer'
      value: { [key: string]: any }
    },
    daoIds?: string[]
}
```

##### JsonSchedulesEntry
```ts
interface JsonSchedulesEntry extends JsonConfigEntry {
  description?: string
  rateNumber: number
  rateUnit: RateUnit
  enabled?: boolean
  serviceName: string
  input?: {
    type: 'input' | 'inputPath' | 'inputTransformer'
    value: { [key: string]: any }
  }
  safeFunctionName: string
  daoIds?: string[]
}
```

##### RateUnit
```ts
enum RateUnit {
  MINUTES = 'minute',
  HOURS = 'hour',
  DAYS = 'day',
}
```

### PackageJson
Manage package.json file.

#### Methods
- `static read(): Promise<any>`\
    **Returns**: the parsed Json object

- `static merge(obj): Promise<void>`\
    Merge package.json content with the input _obj_

- `static removeAtPath(objPath: string): Promise<void>`\
    Remove the specified _objPath_ from the package.json. _objPath_ uses
    [lodash](https://www.npmjs.com/package/lodash) syntax

- `static write(packageJson): Promise<void>`\
    Write the input _packageJson_ object into the package.json file

### PathResolver
Utility class to resolve path of common files and folders.

#### Methods
- `static get getPrjPath(): string`

- `static get getPackageJsonPath(): string`

- `static get getServicesJsonPath(): string`

- `static get getSharedResourcesServerlessJsonPath(): string`

- `static get getOfflineServerlessJsonPath(): string`

- `static get getEnvsPath(): string`

- `static get getConfigsPath(): string`

- `static get getAuthorizersConfigPath(): string`

- `static get getEnvsConfigPath(): string`

- `static get getModelsConfigPath(): string`

- `static get getEndpointsConfigPath(): string`

- `static get getSchedulesConfigPath(): string`

- `static get getDaosConfigPath(): string`

- `static get getDefaultHeadersConfigPath(): string`

- `static get getNodeModulesPath(): string`

- `static get getDistPath(): string`

- `static get getDeployPath(): string`

- `static get getSrcPath(): string`

- `static get getEndpointsPath(): string`

- `static get getDistEndpointsPath(): string`

- `static get getSchedulesPath(): string`

- `static get getDistSchedulesPath(): string`

- `static get getModelsPath(): string`

- `static get getAuthorizersPath(): string`

### ResponseHandler
Utility methods for creating handler functions responses. 

#### Methods
- `static json(response, statusCode: StatusCodes = StatusCodes.OK, options?: ResponseOptions): Response`\
    Creates a Json response object

- `static buffer(data: Buffer, statusCode: StatusCodes = StatusCodes.OK, options?: ResponseOptions): Response`  \
    Creates response object with data encoded in base64

#### Types 

##### Response
```ts
interface Response {
  statusCode: number,
  body: string,
  headers?: HttpHeader
  isBase64Encoded?: boolean
}

```
##### ResponseOptions
```ts
interface ResponseOptions {
  headers?: {
    [key: string]: string
  },
}
```
