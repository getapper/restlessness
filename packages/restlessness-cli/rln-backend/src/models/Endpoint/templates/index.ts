import { Endpoint } from 'root/models';

const indexTemplate = (hasPayload: boolean, vars: string[]): string => `require('module-alias/register');
import handler from './handler';
import { requestParser } from '@restlessness/core';

export default async (event, context) => {
  // @TODO: Add payload validator
  const {
    queryStringParameters,${hasPayload ? '\n      payload,' : ''}${vars.length ? '\n      pathParameters,' : ''}
  } = requestParser(event);
  return await handler({
    queryStringParameters,${hasPayload ? '\n      payload,' : ''}${vars.length ? '\n      pathParameters,' : ''}
  });
};
`;

const handlerTemplate = (hasPayload: boolean, vars: string[]): string => `require('module-alias/register');
import res from 'root/services/response-handler';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      queryStringParameters,${hasPayload ? '\n      payload,' : ''}${vars.length ? '\n      pathParameters,' : ''}
    } = req;

    return res({});
  } catch (e) {
    return res({}, 500);
  }
};
`;

const interfacesTemplate = (hasPayload: boolean, vars: string[]): string => `export interface QueryStringParameters {}${hasPayload
  ? '\n\nexport interface Payload {}' : ''}${vars.length ? `\n\nexport interface PathParameters {
${vars.map(v => `  ${v}: string,`).join('\n')}
}` 
  : ''}

export interface Request {
  queryStringParameters: QueryStringParameters,${hasPayload ? '\n  payload: Payload,' : ''}${vars.length ? '\n  pathParameters: PathParameters,' : ''}
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
