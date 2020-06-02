import { StatusCodes } from '@restlessness/core';

require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';
import Endpoint from 'root/models/Endpoint';

export default async (req: Request) => {
  try {
    const endpoints = await Endpoint.getList();
    return res(
      endpoints, StatusCodes.OK, {
        headers: {
          'Access-Control-Expose-Headers': 'content-range',
          'content-range': `${endpoints.length}`,
        },
      },
    );
  } catch (e) {
    console.error(e);
    res({ message: e.message }, StatusCodes.InternalServerError);
  }
};
