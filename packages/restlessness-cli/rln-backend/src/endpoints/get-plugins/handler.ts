import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Plugin } from '../../models';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      queryStringParameters,
    } = req;

    const plugins = await Plugin.getList();
    return res(plugins, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${plugins.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return res({}, StatusCodes.InternalServerError);
  }
};
