import pluralize from "pluralize";
import kebabCase from "kebab-case";

const modelTemplate = (
  name: string,
): string => `import { Filter, ObjectId, WithId } from "mongodb";
import { mongoDao } from '@restlessness/dao-mongo';

export interface I${name} {
  _id?: ObjectId;
  created: Date;
  v: number;
}

export class ${name} implements WithId<I${name}> {
  _id: ObjectId;
  created: Date;
  v: number;
  
  static get collectionName() {
    return '${kebabCase(
      pluralize(name.charAt(0).toLowerCase() + name.slice(1), 2),
    )}';
  }
  
  constructor(i${name}: I${name}) {
    this.fromInterface(i${name});
    this.v = 1;
  }

  static async create(): Promise<${name} | null> {
    const i${name} = await mongoDao.insertOne<I${name}>(
      ${name}.collectionName,
      {
        created: new Date(),
        v: 1,
      }
    );
    if (i${name}) {
      return new ${name}(i${name});
    }
    return null;
  }

  static async getById(_id: ObjectId): Promise<${name} | null> {
    const i${name} = await mongoDao.findOne<I${name}>(
      ${name}.collectionName,
      {
        _id,
      }
    );
    if (i${name}) {
      return new ${name}(i${name});
    }
    return null;
  }

  async patch(fields: Partial<I${name}>): Promise<void> {
    const result = await mongoDao.updateOne<I${name}>(
      ${name}.collectionName,
      {
        _id: this._id,
      },
      {
        $set: fields
      }
    );
    if (result.modifiedCount !== 1) {
      throw new Error("Patch op was not applied successfully");
    }
    await this.refresh();
  }

  static async delete(_id: ObjectId): Promise<void> {
    const result = await mongoDao.deleteOne<I${name}>(
      ${name}.collectionName,
      {
        _id,
      },
    );
    if (result.deletedCount !== 1) {
      throw new Error("Delete op was not applied successfully");
    }
  }

  static async getList(
    filter: Filter<I${name}> = {},
    {
      limit = 10,
      skip = 0,
      sort = [],
    }: {
      limit?: number;
      skip?: number;
      sort?: {
        by: keyof I${name};
        asc: boolean;
      }[];
    } = {
      limit: 10,
      skip: 0,
      sort: [],
    },
  ): Promise<${name}[]> {
    const i${name}s = await mongoDao.findMany<I${name}>(
      ${name}.collectionName,
      filter,
      {
        limit,
        skip,
        sort: sort.length
          ? Object.fromEntries(sort.map((pair) => [pair.by, pair.asc ? 1 : -1]))
          : undefined,
      },
    );
    return i${name}s.map((i${name}) => new ${name}(i${name}));
  }

  /* Mostly for internal use */

  fromInterface(i${name}: I${name}) {
    if (!i${name}._id) {
      throw new Error("Interface object doesn't have an _id");
    }
    this._id = i${name}._id;
  }

  async refresh() {
    const i${name} = await mongoDao.findOne<I${name}>(
      ${name}.collectionName,
      {
        _id: this._id,
      }
    );
    if (i${name}) {
      this.fromInterface(i${name});
    } else {
      throw new Error("Couldn't find document in DB");
    }
  }
}
`;

export { modelTemplate };
