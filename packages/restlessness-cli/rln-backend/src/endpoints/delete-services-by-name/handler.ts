import 'module-alias/register';
import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import Service from 'root/models/Service';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      pathParameters: { name },
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    await Service.removeService(name);
    return ResponseHandler.json({});
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
