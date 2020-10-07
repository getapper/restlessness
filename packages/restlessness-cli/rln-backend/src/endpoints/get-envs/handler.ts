import { Env } from '../../models';
import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const envs = await Env.getList();
    return ResponseHandler.json(envs, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${envs.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
