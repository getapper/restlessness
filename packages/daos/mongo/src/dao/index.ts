import path from 'path';
import { Db, InsertOneWriteOpResult, MongoClient, UpdateWriteOpResult } from 'mongodb';

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

  async openConnection(context: AWSLambda.Context) {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      this.checkConnection();
      return this.mongoClient;
    } catch (e) {

    }
    const config = require(path.join(process.cwd(), 'config.json'));
    const uri = config?.mongo?.uri ?? null;
    if (uri === null) {
      throw new Error('No mongo configuration found in config.json');
    }
    // @TODO: Close if open
    this.mongoClient = await MongoClient.connect(config.mongo.uri);
    this.db = this.mongoClient.db();
  }

  async findOne(collectionName: string, filters, options?): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).findOne(filters, options);
  }

  async find(collectionName: string, query, options?): Promise<any> {
    this.checkConnection();
    return this.db.collection(collectionName).find(query, options).toArray();
  }

  async insertOne(collectionName: string, object): Promise<InsertOneWriteOpResult> {
    this.checkConnection();
    return this.db.collection(collectionName).insertOne(object);
  }

  async updateOne(collectionName: string, filter, object): Promise<UpdateWriteOpResult> {
    this.checkConnection();
    return this.db.collection(collectionName).updateOne(filter, object);
  }
}

const mongoDao = new MongoDao();

export default mongoDao;

export {
  MongoDao,
};
