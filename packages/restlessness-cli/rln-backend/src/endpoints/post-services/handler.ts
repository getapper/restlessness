import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import Service from '../../models/Service';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      payload,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    const service = await Service.addService(payload.name);
    return ResponseHandler.json(service);
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
