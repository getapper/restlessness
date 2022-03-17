import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { Project, JsonDaos } from '@restlessness/core';
import { ObjectId } from 'mongodb';
import MongoDaoPackage, { yupObjectId } from '.';
import * as yup from 'yup';

const PROJECT_NAME = 'tmp-mongo-dao';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async () => {
  await promisify(rimraf)(projectPath);
});

describe('Mongo Dao Package hooks', () => {
  test('New project post install',  async () => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    await MongoDaoPackage.postInstall();
    await JsonDaos.read();
    const jsonDaosEntry = await JsonDaos.getEntryById('dao-mongo');
    expect(jsonDaosEntry.package).toBe('@restlessness/dao-mongo');
    await expect(MongoDaoPackage.postInstall()).rejects.toEqual(new Error('Entry with id dao-mongo already exists'));
  });

  test('Yup object id validator',  async () => {
    const schema = yup.object().shape({
      _id: yupObjectId().required(),
    });

    await expect(schema.validate({ _id: 'jimmy' }))
      .rejects
      .toThrow();
    await expect(schema.validate({}))
      .rejects
      .toThrow();
    await schema.validate({ _id: new ObjectId() });
    const objId = new ObjectId();
    const result = await schema.validate({ _id: objId.toHexString() });
    expect(objId.equals(result._id)).toBe(true);
  });
});

afterAll(async () => {
  await promisify(rimraf)(projectPath);
});
