import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Plugin } from '../../models';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      queryStringParameters,
    } = req;

    const plugins = await Plugin.getList();
    return ResponseHandler.json(plugins, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${plugins.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
