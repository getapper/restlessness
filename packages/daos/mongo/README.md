# @restlessness/dao-mongo [![npm version](https://img.shields.io/npm/v/@restlessness/dao-mongo.svg?style=flat)](https://www.npmjs.com/package/@restlessness/dao-mongo)
This is the official [MongoDB](https://www.mongodb.com/) DAO [(Data Access Object)](https://it.wikipedia.org/wiki/Data_Access_Object) for the [restlessness](https://github.com/getapper/restlessness) framework.

This package relies on the plugin [serverless-mongo-proxy](https://www.github.com/getapper/serverless-mongo-proxy)
to create a database proxy.

## Installation
From you restlessness project root run:
Take me to [pookie](#pookie)
```shell script
$ # Install node package
$ npm i @restlessness/dao-mongo
$
$ # Add it to the project using the restlessness cli
$ restlessness add-dao @restlessness/dao-mongo
```

The `add-dao` command installs the `serverless-mongo-proxy` plugin and adds proper permissions to
allow lambda invocation.

## Environment variables
| Name | Description |
-------|--------------
| MONGO_URI | Database uri (example: mongodb://localhost:27017 |
| MONGO_DB_NAME | Database name |

The `add-dao` command also adds parametric environment variables to the .env files present in the project.

Example **.env.production** file:
```
MONGO_URI=${MONGO_URI_PRODUCTION}
```
Then is possible to set the variable by setting `MONGO_URI_PRODUCTION` or setting `MONGO_URI` directly.


## Usage
The restlessness web-interface allows creating models based on the exported `MongoBase` class, which already has
convenience methods for db query.

Example:
```ts
// src/Models/User/index.ts

import { MongoBase } from '@restlessness/dao-mongo';

export default class User extends MongoBase {
  ['constructor']: typeof MyModel
  name: string
  surname: string

  static get collectionName() {
    return 'user';
  }

  // ...
};
```

All convenience methods can be accessed from the extended class:
```ts
// ...
const user = new User();
await user.getById(id);
console.log(user.name, user.surname);

user.name = 'Arthur';
user.surname = 'Dent';
await user.save();
// ...
``` 



The package also exports a `mongoDao` object (of type `MongoDao`) that can be used to directly run a query.

Example:
```ts

// src/endpoints/get-user/handler.ts

import { mongoDao } from '@restlessness/dao-mongo';
// ...
const user = { name: 'Arthur', surname: 'Dent' };
const result = await mongoDao.insertOne('my-collection', user);
// ...
```

## Documentation

### <a name="mongobase"></a> MongoBase `class`
###### Methods:
- **static get collectionName()**:\
    **Returns**: the collection name used for all the query

- **static get dao(): MongoDao**:\
    **Returns**: the MongoDao object used to perform all the query

- **getById(_id: ObjectId): Promise<boolean>**:\
    Get the resource by assigning it to the current object\
    **_id**: the id of the resource to be queried\
    **Returns**: `true` if an entry with the provided id has been found, `false` otherwise

- **static getList<T>(query: QuerySelector<T> = {}, limit: number = 10, skip: number = 0, sortBy: string = null, asc: boolean = true): Promise<T[]>**:\
    Get a list of elements satisfying the provided query\
    **query**: query constraint\
    **limit**: maximum number of elements returned\
    **skip**: number of element to be skipped when returning the list\
    **sortBy**: sorting key\
    **asc**: ascending or descending order\
    **Returns**: list of element that satisfy the query

- **static getCounter<T>(query: QuerySelector<T> = {}): Promise<number>**:\
    Get the number of element that satisfy the provided query\
    **query**: query constraint\
    **Returns**: number of element that satisfy the `QuerySelector`

- **save(): Promise<boolean>**:\
    Save the current object\
    **Returns**: `true` if the operation is successful, `false` otherwise

- **update(): Promise<boolean>**:\
    Update the current object\
    **Returns**: `true` if the operation is successful, `false` otherwise

- **patch(fields: any): Promise<boolean>**:\
    Update the specified fields for the current object
    **fields**: fields to the updated\
    **Returns**: `true` if the operation is successful, `false` otherwise

- **remove<T>(): Promise<boolean>**:\
    Remove the element from the db\
    **Returns**: `true` if the operation is successful, `false` otherwise

- **static createIndex(keys: string | any, options: IndexOptions): Promise<boolean>**:\
    **keys**: keys on which the index will be created\
    **options**: index options\
    **Returns**: `true` if the operation is successful, `false` otherwise


### <a name="mongodao"></a> mongoDao `object`
###### Methods:
- **invokeProxy(request: ProxyRequest): Promise<InvocationResponse>**:\
    Invoke the [database proxy lambda](https://www.github.com/getapper/serverless-mongo-proxy),
    which will execute the query and return the result\
    **request**: object representing the requested query,
    see [serverless-mongo-proxy](https://www.github.com/getapper/serverless-mongo-proxy)
    for details\
    **Returns**: result of invocation

- **findOne(collectionName: string, filter: Object, options?: FindOneOptions): Promise<any>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details\
    **Returns**: the object satisfying the query

- **find(collectionName: string, filter: Object, options?: FindOneOptions): Promise<any>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details\
    **Returns**: the objects satisfying the query

- **insertOne(collectionName: string, object): Promise<InsertOneWriteOpResult<null>>**:\
    **collectionName**: name of the collection to query\
    **object**: the object to be inserted into the db\
    **Returns**: insert result, see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details

- **updateOne(collectionName: string, filter: Object, object, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **object**: the object to be updated\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details\
    **Returns**: update result, see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details

- **updateMany(collectionName: string, filter: Object, object, options?: UpdateManyOptions): Promise<UpdateWriteOpResult>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **object**: the object to be updated\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details\
    **Returns**: update result, see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details

- **deleteOne(collectionName: string, filter: Object): Promise<DeleteWriteOpResultObject>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **Returns**: delete result, see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details

- **deleteMany(collectionName: string, filter: Object): Promise<DeleteWriteOpResultObject>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **Returns**: update result, see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details

- **count(collectionName: string, filter: Object, options?: MongoCountPreferences): Promise<number>**:\
    **collectionName**: name of the collection to query\
    **filter**: query filter\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details\
    **Returns**: number of element satisfying the query

- **createIndex(collectionName: string, keys: string | any, options: IndexOptions): Promise<string>**:\
    **collectionName**: name of the collection to query\
    **keys**: keys on which the index will be created\
    **options**: see [mongodb types](https://www.npmjs.com/package/@types/mongodb) for details
    **Returns**: identifier of the created index
