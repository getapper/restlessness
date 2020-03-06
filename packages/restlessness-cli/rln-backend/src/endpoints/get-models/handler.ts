require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,
    } = req;

    return res({});
  } catch (e) {
    return res({}, 500);
  }
};
