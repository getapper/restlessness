import 'module-alias/register';
import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Auth } from 'root/models';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const auths = await Auth.getList();
    const emptyAuth = new Auth();
    emptyAuth.id = 'null';
    emptyAuth.name = 'None';
    auths.push(emptyAuth);
    return res(auths, 200, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${auths.length}`,
      },
    });
  } catch (e) {
    return res({}, StatusCodes.InternalServerError);
  }
};
