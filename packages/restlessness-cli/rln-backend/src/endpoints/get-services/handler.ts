import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import Service from '../../models/Service';

export default async (req: Request) => {
  try {
    const {
      validationResult,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    return ResponseHandler.json({
      services: await Service.getServiceNameList(),
    });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
