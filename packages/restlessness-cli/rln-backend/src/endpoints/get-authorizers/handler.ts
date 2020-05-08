import 'module-alias/register';
import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';
import { Authorizer } from 'root/models';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    const authorizers = await Authorizer.getList();
    const emptyAuthorizer = new Authorizer();
    emptyAuthorizer.id = 'null';
    emptyAuthorizer.name = 'None';
    authorizers.push(emptyAuthorizer);
    return res(authorizers, 200, {
      headers: {
        'Access-Control-Expose-Headers': 'content-range',
        'content-range': `${authorizers.length}`,
      },
    });
  } catch (e) {
    console.error(e);
    return res({}, StatusCodes.InternalServerError);
  }
};
