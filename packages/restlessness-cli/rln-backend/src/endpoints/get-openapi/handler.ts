import { promises as fs } from 'fs';
import { ResponseHandler, StatusCodes, Openapi } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  const openapi:Openapi = new Openapi();
  await openapi.create();

  return ResponseHandler.json(openapi, StatusCodes.OK);
};
