import res from '../../services/response-handler';
import { Dao, Model } from '../../models';
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

    if (!daoId || daoId === 'null') {
      dao = null;
    } else {
      dao = await Dao.getById(daoId);
      if (!dao) {
        return res({ message: 'Dao not found' }, 404);
      }
    }
    const model = new Model();
    // @TODO: Check it doesn't already exist in models.json file
    await model.create(name, dao);

    return res(model);
  } catch (e) {
    console.error(e);
    return res({ message: e.message }, 500);
  }
};
