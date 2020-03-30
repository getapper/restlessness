import { Endpoint } from 'root/models';

const indexTemplate = (hasPayload: boolean, vars: string[]): string => `import 'module-alias/register';
import handler from './handler';
import { requestParser } from '@restlessness/core';
import { res, StatusCodes } from '@restlessness/core';
import validations from './validations';

export default async (event, context) => {
  const {
    validationResult,
    queryStringParameters,${hasPayload ? '\n    payload,' : ''}${vars.length ? '\n    pathParameters,' : ''}
  } = requestParser(event, context, validations);
  return await handler({
    validationResult,
    queryStringParameters,${hasPayload ? '\n    payload,' : ''}${vars.length ? '\n    pathParameters,' : ''}
  });
};
`;

const handlerTemplate = (hasPayload: boolean, vars: string[]): string => `import 'module-alias/register';
import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    validationResult,
    ${hasPayload || vars.length ? `const {
${hasPayload ? '      payload,\n' : ''}${vars.length ? '      pathParameters,\n' : ''}    } = req;\n` : ''}
    return res({});
  } catch (e) {
    return res({}, StatusCodes.InternalServerError);
  }
};
`;

const interfacesTemplate = (hasPayload: boolean, vars: string[]): string => `import { ValidationResult } from '@restlessness/core';

export interface QueryStringParameters {}${hasPayload
  ? '\n\nexport interface Payload {}' : ''}${vars.length ? `\n\nexport interface PathParameters {
${vars.map(v => `  ${v}: string,`).join('\n')}
}` 
  : ''}

export interface Request {
  validationResult: ValidationResult,
  queryStringParameters: QueryStringParameters,${hasPayload ? '\n  payload: Payload,' : ''}${vars.length ? '\n  pathParameters: PathParameters,' : ''}
}
`;

const validationsTemplate = (hasPayload: boolean, vars: string[]): string => `import * as yup from 'yup';
import { QueryStringParameters${hasPayload ? ', Payload' : ''}${vars.length ? ', PathParameters' : ''} } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations: YupShapeByInterface<QueryStringParameters> = {};${hasPayload ?'\nconst payloadValidations: YupShapeByInterface<Payload> = {};' :''}${vars.length ? `\nconst pathParametersValidations: YupShapeByInterface<PathParameters> = {\n${vars.map(v => `  ${v}: yup.string().required(),`).join('\n')}\n};` : '' }

export default {
  queryStringParameters: yup.object().shape(queryStringParametersValidations),${hasPayload ?'\n  payload: yup.object().shape(payloadValidations),' :''}${vars.length ? '\n  pathParameters: yup.object().shape(pathParametersValidations),' : '' }
};

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
  validationsTemplate,
};
