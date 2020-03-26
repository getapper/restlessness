import mongoDao, { MongoDao } from '../dao';
import { ObjectId } from 'bson';
import { InsertOneWriteOpResult, UpdateWriteOpResult } from 'mongodb';

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

  async save() {
    this.created = new Date();
    const response: InsertOneWriteOpResult = await MongoBase.dao.insertOne(this.constructor.collectionName, this);
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
}
