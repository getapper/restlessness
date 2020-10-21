import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Schedule } from '../../models';

export default async (req: Request) => {
  try {
    const schedules: Schedule[] = await Schedule.getList();
    return ResponseHandler.json(
      { schedules }, StatusCodes.OK, {
        headers: {
          'Access-Control-Expose-Headers': 'content-range',
          'content-range': `${schedules.length}`,
        },
      },
    );
  } catch (e) {
    console.error(e);
    ResponseHandler.json({ message: e.message }, StatusCodes.InternalServerError);
  }
};
