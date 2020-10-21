import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Schedule } from '../../models';

export default async (req: Request) => {
  const {
    payload,
  } = req;
  const {
    name,
    description,
    rateNumber,
    rateUnit,
    daoIds,
    serviceName,
  } = payload;
  const schedules = await Schedule.getList();
  if (schedules.find(s => s.name === name)) {
    return ResponseHandler.json({ message: 'Schedule with this name already exists' }, StatusCodes.BadRequest);
  }
  const schedule = new Schedule();
  await schedule.create({
    name,
    description,
    rateNumber,
    rateUnit,
    serviceName,
    daoIds,
  });
  return ResponseHandler.json({schedule});
};
