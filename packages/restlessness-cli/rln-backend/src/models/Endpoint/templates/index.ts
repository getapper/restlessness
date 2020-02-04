const indexTemplate = () => `require('module-alias/register');
import handler from './handler';

export default async (event, context) => {
  // @TODO: Add lib request parser
  // @TODO: Add payload Joi validator
  const payload = JSON.parse(event.body);
  return await handler({ payload });
};
`;

const handlerTemplate = () => `require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';

export default async (req: Request) => {
  const {
    payload,
  } = req;
  return res({});
};
`;

const interfacesTemplate = () => `export interface Payload {}

export interface Request {
  payload: Payload
}
`;

export {
  indexTemplate,
  handlerTemplate,
  interfacesTemplate,
};
