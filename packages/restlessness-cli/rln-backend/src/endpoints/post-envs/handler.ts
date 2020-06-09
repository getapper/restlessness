require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';
import { Env } from 'root/models';

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
      return res({ message: 'Env already exists' }, 400);
    }
    const env = new Env();
    await env.create(parsedName);

    return res(env);
  } catch (e) {
    return res({}, 500);
  }
};
