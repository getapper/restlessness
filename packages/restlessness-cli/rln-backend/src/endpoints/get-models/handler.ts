import res from '../../services/response-handler';
import { Request } from './interfaces';
import { Model } from 'root/models';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const models = await Model.getList();
    return res(models, 200, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${models.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return res({ message: e.message }, 500);
  }
};
