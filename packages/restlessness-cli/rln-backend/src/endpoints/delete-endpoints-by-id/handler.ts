import { ResponseHandler, StatusCodes } from '@restlessness/core';
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

    const endpoint: Endpoint = await Endpoint.getById(id);
    await endpoint.remove();

    return ResponseHandler.json(endpoint);
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
