import 'module-alias/register';
import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import Service from 'root/models/Service';

export default async (req: Request) => {
  try {
    const {
      validationResult,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    return ResponseHandler.json(await Service.getServiceNameList());
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
