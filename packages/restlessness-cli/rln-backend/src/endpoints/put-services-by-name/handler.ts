import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import Service from '../../models/Service';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      payload: { serviceName: newServiceName },
      pathParameters: { name: serviceName },
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }
    if (!await Service.getService(serviceName)) {
      return ResponseHandler.json({ message: `Service ${serviceName} not found!` }, StatusCodes.NotFound);
    }

    await Service.renameService(serviceName, newServiceName);
    return ResponseHandler.json({});
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
