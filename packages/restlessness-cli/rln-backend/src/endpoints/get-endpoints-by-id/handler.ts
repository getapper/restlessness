import { res, StatusCodes } from '@restlessness/core';
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
      return res({ message: validationResult.message }, StatusCodes.BadRequest);
    }
    
    return res(Endpoint.getById(id));
  } catch (e) {
    console.error(e);
    return res({}, StatusCodes.InternalServerError);
  }
};
