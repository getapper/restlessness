import res from '../../services/response-handler';
import { StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint } from '../../models';

export default async (req: Request) => {
  try {
    const endpoints: Endpoint[] = await Endpoint.getList();
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
