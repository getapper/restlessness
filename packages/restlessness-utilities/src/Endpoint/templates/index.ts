import Authorizer from 'root/JsonAuthorizer';
import Endpoint from 'root/Endpoint';

const indexTemplate = (
  hasPayload: boolean,
  vars: string[],
  authorizer: Authorizer,
): string => `import 'module-alias/register';
import handler from './handler';
import { requestParser } from '@restlessness/core';
import validations from './validations';
${authorizer ? `import { AuthorizerContext, sessionParser } from '${authorizer.package}';\nimport ${authorizer.sessionModelName} from 'root/models/${authorizer.sessionModelName}';\n` : ''}
export default async (event: AWSLambda.APIGatewayProxyEventBase<${authorizer ? 'AuthorizerContext' : 'null'}>, context: AWSLambda.Context) => {
  const {
    validationResult,
    queryStringParameters,${hasPayload ? '\n    payload,' : ''}${vars.length ? '\n    pathParameters,' : ''}
  } = await requestParser<${authorizer ? 'AuthorizerContext' : 'null'}>(event, context, validations);
${authorizer ? `  const session: ${authorizer.sessionModelName} = await sessionParser<${authorizer.sessionModelName}>(${authorizer.sessionModelName}, event, context);\n` : ''}
  return await handler({
    validationResult,
    queryStringParameters,${hasPayload ? '\n    payload,' : ''}${vars.length ? '\n    pathParameters,' : ''}${authorizer ? '\n    session,' : ''}
  });
};
`;

const testTemplate = (
  apiName: string,
  authorizer: Authorizer,
): string => `import { StatusCodes, apiCall } from '@restlessness/core';
${authorizer ? `import { AuthorizerContext } from '${authorizer.package}';\nimport ${authorizer.sessionModelName} from 'root/models/${authorizer.sessionModelName}';\n` : ''}
const ${apiName} = '${apiName}';

test('', async (done) => {
  const res = await apiCall${authorizer ? '<AuthorizerContext>' : ''}(${apiName});
  // expect(res.statusCode).toBe(StatusCodes.OK);
  done();
});

/*
afterAll(async done => {
  await mongoDao.closeConnection();
  done();
});
*/
`;

const handlerTemplate = (hasPayload: boolean, vars: string[], authorizer: Authorizer): string => `import 'module-alias/register';
import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      validationResult,
${hasPayload ? '      payload,\n' : ''}${vars.length ? '      pathParameters,\n' : ''}${authorizer ? '      session,\n' : ''}    } = req;

    /*
    if (!validationResult.isValid) {
      return res({ message: validationResult.message }, StatusCodes.BadRequest);
    }
    */
    
    return res({});
  } catch (e) {
    return res({}, StatusCodes.InternalServerError);
  }
};
`;

const interfacesTemplate = (hasPayload: boolean, vars: string[], authorizer: Authorizer): string => `import { ValidationResult } from '@restlessness/core';
${authorizer ? `import ${authorizer.sessionModelName} from 'root/models/${authorizer.sessionModelName}';\n` : ''}
export interface QueryStringParameters {}${hasPayload
  ? '\n\nexport interface Payload {}' : ''}${vars.length ? `\n\nexport interface PathParameters {
${vars.map(v => `  ${v}: string,`).join('\n')}
}`
  : ''}

export interface Request {
  validationResult: ValidationResult,
  queryStringParameters: QueryStringParameters,${hasPayload ? '\n  payload: Payload,' : ''}${vars.length ? '\n  pathParameters: PathParameters,' : ''}${authorizer ? `\n  session: ${authorizer.sessionModelName},` : ''}
}
`;

const validationsTemplate = (hasPayload: boolean, vars: string[]): string => `import * as yup from 'yup';
import { QueryStringParameters${hasPayload ? ', Payload' : ''}${vars.length ? ', PathParameters' : ''} } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations: YupShapeByInterface<QueryStringParameters> = {};${hasPayload ?'\nconst payloadValidations: YupShapeByInterface<Payload> = {};' :''}${vars.length ? `\nconst pathParametersValidations: YupShapeByInterface<PathParameters> = {\n${vars.map(v => `  ${v}: yup.string().required(),`).join('\n')}\n};` : '' }

export default {
  queryStringParameters: yup.object().shape(queryStringParametersValidations),${hasPayload ?'\n  payload: yup.object().shape(payloadValidations).noUnknown(),' :''}${vars.length ? '\n  pathParameters: yup.object().shape(pathParametersValidations),' : '' }
};

`;

const exporterTemplate = (endpoints: Endpoint[]) => `import 'module-alias/register';
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
  testTemplate,
};
