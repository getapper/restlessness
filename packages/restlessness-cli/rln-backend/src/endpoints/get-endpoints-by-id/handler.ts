import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Endpoint } from '../../models';

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

    return ResponseHandler.json(Endpoint.getById(id));
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
