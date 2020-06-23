import { Openapi } from 'root/models';
import { promises as fs } from 'fs';

import { ResponseHandler, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  const openapi:Openapi = new Openapi();
  await openapi.create();
  const swaggerBuffer = await fs.readFile(Openapi.openapiJsonPath);
  const swagger = JSON.parse(swaggerBuffer.toString());

  return ResponseHandler.json(
    swagger, StatusCodes.OK, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${swagger.length}`,
      },
    },
  );
};
