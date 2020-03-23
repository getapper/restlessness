require('module-alias/register');
import res from 'root/services/response-handler';
import { Dao, Model } from 'root/models';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
      payload,
    } = req;
    const {
      daoId,
      name,
    } = payload;
    let dao: Dao;

    if (daoId === 'null') {
      dao = null;
    } else {
      dao = new Dao();
      const exists = await dao.getById(daoId);
      if (!exists) {
        return res({ message: 'Dao not found' }, 404);
      }
    }
    const model = new Model();
    // @TODO: Check it doesn't already exist in models.json file
    await model.create(dao, name);

    return res(model);
  } catch (e) {
    console.error(e);
    return res({ message: e.message }, 500);
  }
};
