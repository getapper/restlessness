import Openapi from 'root/models/Openapi';

require('module-alias/register');
import { promises as fs } from 'fs';

import res from 'root/services/response-handler';
import { Request } from './interfaces';

export default async (req: Request) => {
  const openapi:Openapi = new Openapi();
  await openapi.create();
  const swaggerBuffer = await fs.readFile(Openapi.openapiJsonPath);
  const swagger = JSON.parse(swaggerBuffer.toString());

  return res(
    swagger, 200, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${swagger.length}`,
      },
    }
  );
};
