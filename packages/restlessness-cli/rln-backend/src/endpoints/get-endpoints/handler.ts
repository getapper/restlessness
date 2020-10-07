import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint } from '../../models';

export default async (req: Request) => {
  try {
    const endpoints: Endpoint[] = await Endpoint.getList();
    return ResponseHandler.json(
      endpoints, StatusCodes.OK, {
        headers: {
          'Access-Control-Expose-Headers': 'content-range',
          'content-range': `${endpoints.length}`,
        },
      },
    );
  } catch (e) {
    console.error(e);
    ResponseHandler.json({ message: e.message }, StatusCodes.InternalServerError);
  }
};
