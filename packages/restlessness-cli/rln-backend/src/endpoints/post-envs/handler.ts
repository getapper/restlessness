import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Env } from '../../models';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
      payload,
    } = req;
    const {
      name,
    } = payload;

    const parsedName = name.trim().replace(/ /g, '').toLowerCase();
    const envs = await Env.getList();
    if (~envs.findIndex(env => env.id === parsedName)) {
      return ResponseHandler.json({ message: 'Env already exists' }, StatusCodes.BadRequest);
    }
    const env = new Env();
    await env.create(parsedName);

    return ResponseHandler.json(env);
  } catch (e) {
    return ResponseHandler.json({}, StatusCodes.InternalServerError);
  }
};
