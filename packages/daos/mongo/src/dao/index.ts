import path from 'path';
import {
  Db,
  InsertOneWriteOpResult,
  MongoClient,
  UpdateWriteOpResult,
  FindOneOptions,
  DeleteWriteOpResultObject,
} from 'mongodb';

class MongoDao {
  mongoClient: MongoClient
  db: Db

  constructor() {
    this.mongoClient = null;
    this.db = null;
  }

  checkConnection() {
    if (this.mongoClient === null) {
      throw new Error('Mongo connection not initialized');
    }
  }

  async closeConnection() {
    if (this.mongoClient !== null) {
      await this.mongoClient.close();
    }
  }

  async openConnection(context?: AWSLambda.Context) {
    if (context) {
      context.callbackWaitsForEmptyEventLoop = false;
    }
    try {
      this.checkConnection();
      return this.mongoClient;
    } catch (e) {
      this.mongoClient = await MongoClient.connect(process.env['RLN_MONGO_DAO_URI']);
      this.db = this.mongoClient.db();
    }
  }

  async findOne(collectionName: string, filters, options?): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).findOne(filters, options);
  }

  async find(collectionName: string, query, options?: FindOneOptions): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).find(query, options).toArray();
  }

  async insertOne(collectionName: string, object): Promise<InsertOneWriteOpResult<null>> {
    this.checkConnection();
    return this.db.collection(collectionName).insertOne(object);
  }

  async updateOne(collectionName: string, filter, object): Promise<UpdateWriteOpResult> {
    this.checkConnection();
    return this.db.collection(collectionName).updateOne(filter, object);
  }

  async deleteOne(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    this.checkConnection();
    return this.db.collection(collectionName).deleteOne(filter);
  }

  async deleteMany(collectionName: string, filter): Promise<DeleteWriteOpResultObject> {
    this.checkConnection();
    return this.db.collection(collectionName).deleteMany(filter);
  }
  
  async createIndex(collectionName: string, keys, options): Promise<void> {
    this.checkConnection();
    return this.db.collection(collectionName).createIndex(keys, options);
  }
}

const mongoDao = new MongoDao();

export default mongoDao;

export {
  MongoDao,
};
