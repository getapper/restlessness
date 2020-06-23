import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Dao } from '../../models';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const daos = await Dao.getList();
    const emptyDao = new Dao();
    emptyDao.id = 'null';
    emptyDao.name = 'None';
    daos.push(emptyDao);
    return ResponseHandler.json(daos, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${daos.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
