import res from '../../services/response-handler';
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
    return res(daos, 200, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${daos.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return res({}, 500);
  }
};
