import mongoDao, { MongoDao } from '../dao';
import {
  ObjectId,
  InsertOneWriteOpResult,
  UpdateWriteOpResult,
  FindOneOptions,
  QuerySelector,
  DeleteWriteOpResultObject,
} from 'mongodb';

export default class MongoBase {
  ['constructor']: typeof MongoBase
  _id: ObjectId
  created: Date
  lastEdit: Date

  static get collectionName() {
    return '';
  }

  static get dao(): MongoDao {
    return mongoDao;
  }

  async getById(_id: ObjectId): Promise<boolean> {
    const result = await MongoBase.dao.findOne(this.constructor.collectionName, {
      _id,
    });
    if (result) {
      Object.assign(this, result);
    }
    return result !== null;
  }

  static async getList<T>(query: QuerySelector<T> = {}, limit: number = 10, skip: number = 0, sortBy: string = null, asc: boolean = true): Promise<T[]> {
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

  async save() {
    this.created = new Date();
    const response: InsertOneWriteOpResult<MongoBase> = await MongoBase.dao.insertOne(this.constructor.collectionName, this);
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
      const response: UpdateWriteOpResult = await MongoBase.dao.updateOne(this.constructor.collectionName, { _id: this._id }, fields);
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
      return !!response?.result?.ok ?? false;
    }
    return false;
  }

  async remove<T>(): Promise<boolean> {
    if (this._id) {
      const response: DeleteWriteOpResultObject = await MongoBase.dao.deleteOne(this.constructor.collectionName, {
        _id: this._id,
      });
      return response?.result?.ok === 1 || false;
    }
    return false;
  }
}
