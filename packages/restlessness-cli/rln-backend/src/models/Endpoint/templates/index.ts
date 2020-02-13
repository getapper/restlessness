import { Endpoint } from 'root/models';

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
  try {
    const {
      
    } = req;

    return res({});
  } catch (e) {
    return res({}, 500);
  }
};
`;

const interfacesTemplate = () => `export interface Payload {}

export interface Request {
  payload: Payload
}
`;

const exporterTemplate = (endpoints: Endpoint[]) => `require('module-alias/register');
${endpoints.map(endpoint => `import ${endpoint.method}${endpoint.route.functionName} from 'root/endpoints/${endpoint.method}-${endpoint.route.folderName}';`).join('\n')}

export {
  ${endpoints.map(endpoint => `${endpoint.method}${endpoint.route.functionName},`).join('\n  ')}
};

`;

export {
  indexTemplate,
  handlerTemplate,
  interfacesTemplate,
  exporterTemplate,
};
