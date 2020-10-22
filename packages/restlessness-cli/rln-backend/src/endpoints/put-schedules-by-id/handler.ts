import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Schedule, Dao, Authorizer } from '../../models';

export default async (req: Request) => {
  try {
    const {
      validationResult,
      payload,
      pathParameters,
    } = req;

    if (!validationResult.isValid) {
      return ResponseHandler.json({ message: validationResult.message }, StatusCodes.BadRequest);
    }

    const { id } = pathParameters;
    const {
      description,
      rateNumber,
      rateUnit,
      daoIds,
      serviceName,
      enabled,
    } = payload;

    const schedule = await Schedule.getById(id);
    if (!schedule) {
      return ResponseHandler.json({ message: `Cannot find schedule with id ${id}` }, StatusCodes.BadRequest);
    }

    schedule.description = description;
    schedule.rateNumber = rateNumber;
    schedule.rateUnit = rateUnit;
    schedule.serviceName = serviceName;
    if (daoIds?.length) {
      schedule.daos = (await Promise.all(daoIds.map(id => Dao.getById(id)))).filter(d => !!d);
    } else {
      schedule.daos = [];
    }
    schedule.enabled = enabled;
    await schedule.update();

    return ResponseHandler.json({ schedule });
  } catch (e) {
    console.error(e);
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
