import { ResponseHandler, StatusCodes } from '@restlessness/core';
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
        return ResponseHandler.json({ message: 'Dao not found' }, StatusCodes.NotFound);
      }
    }
    const model = new Model();
    // @TODO: Check it doesn't already exist in models.json file
    await model.create(name, dao);

    return ResponseHandler.json(model);
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({ message: e.message }, StatusCodes.InternalServerError);
  }
};
