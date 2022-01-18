import mongoDao, { MongoDao } from '../dao';
import {
  ObjectId,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  FindOneOptions,
  DeleteWriteOpResultObject,
  FilterQuery,
} from 'mongodb';

export interface MongoBaseInterface {
  _id: ObjectId,
}

export default class MongoBase<TInterface extends MongoBaseInterface> {
  ['constructor']: typeof MongoBase
  _id: ObjectId
  created: Date
  lastEdit: Date

  static get dao(): MongoDao {
    return mongoDao;
  }

  static get collectionName() {
    return '';
  }

  async fromInterfaceToModel(mongoI: TInterface) {
    Object.assign(this, mongoI);
  }

  async refresh(): Promise<boolean> {
    const result = await MongoBase.dao.findOne(this.constructor.collectionName, {
      _id: this._id,
    });
    if (result) {
      await this.fromInterfaceToModel(result);
    }
    return Boolean(result);
  }

  static async getById<TInterface extends MongoBaseInterface>(_id: ObjectId): Promise<TInterface | null> {
    const result = await MongoBase.dao.findOne(this.collectionName, {
      _id,
    });
    return result ?? null;
  }

  static async getList<T>(query: FilterQuery<T> = {}, limit: number = 10, skip: number = 0, sortBy: string = null, asc: boolean = true): Promise<T[]> {
    const options: FindOneOptions = {};
    options.limit = limit;
    if (sortBy) {
      options.sort = {
        [sortBy]: asc ? 1 : -1,
      };
    }
    if (skip !== null) {
      options.skip = skip;
    }
    const results = await MongoBase.dao.find(this.collectionName, query, options);
    return results.map(r => {
      const i = new this();
      Object.assign(i, r);
      return i;
    });
  }

  static async getCounter<T>(query: FilterQuery<T> = {}): Promise<number> {
    return MongoBase.dao.count(this.collectionName, query, {});
  }

  async save() {
    this.created = new Date();
    const response: InsertOneWriteOpResult<TInterface> = await MongoBase.dao.insertOne(this.constructor.collectionName, this);
    if (response?.result?.ok) {
      this._id = response?.insertedId;
    }
    return response?.result?.ok ?? false;
  }

  async update() {
    if (this._id) {
      this.lastEdit = new Date();
      const {
        _id,
        ...fields
      } = this;
      const response: UpdateWriteOpResult = await MongoBase.dao.updateOne(this.constructor.collectionName, { _id: this._id }, { $set: fields });
      return response?.result?.ok ?? false;
    }
    return false;
  }

  async patch(fields: any): Promise<boolean> {
    if (this._id) {
      this.lastEdit = new Date();
      const response: UpdateWriteOpResult = await MongoBase.dao.updateOne(this.constructor.collectionName, { _id: this._id }, {
        $set: fields,
      });
      if (response?.result?.ok) {
        await this.refresh();
      }
      return !!response?.result?.ok ?? false;
    }
    return false;
  }

  async remove(): Promise<boolean> {
    if (this._id) {
      const response: DeleteWriteOpResultObject = await MongoBase.dao.deleteOne(this.constructor.collectionName, {
        _id: this._id,
      });
      return response?.result?.ok === 1 || false;
    }
    return false;
  }

  static async createIndex(keys, options): Promise<boolean> {
    const response: string = await MongoBase.dao.createIndex(this.collectionName, keys, options);
    return !!response;
  }
}
