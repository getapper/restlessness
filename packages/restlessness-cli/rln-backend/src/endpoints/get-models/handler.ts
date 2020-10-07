import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Model } from '../../models';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const models = await Model.getList();
    return ResponseHandler.json(models, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${models.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({ message: e.message }, StatusCodes.InternalServerError);
  }
};
