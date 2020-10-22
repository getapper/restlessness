import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Schedule } from '../../models';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      pathParameters,
    } = req;

    const {
      id,
    } = pathParameters;
    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    const schedule: Schedule = await Schedule.getById(id);
    await schedule.remove();

    return ResponseHandler.json({});
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
