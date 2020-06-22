import { JsonAuthorizersEntry } from '../../JsonAuthorizers';
import Route from '../../Route';
import { JsonEndpointsEntry } from '../';

const indexTemplate = (jsonEndpointsEntry: JsonEndpointsEntry) => `import 'module-alias/register';
import { LambdaHandler } from '@restlessness/core';
import handler from './handler';
import validations from './validations';

export default LambdaHandler.bind(this, handler, validations, '${jsonEndpointsEntry.safeFunctionName}');
`;

const testTemplate = (
  jsonEndpointsEntry: JsonEndpointsEntry,
  authorizer: JsonAuthorizersEntry,
): string => `import { StatusCodes, TestHandler } from '@restlessness/core';
${authorizer ? `import { AuthorizerContext } from '${authorizer.package}';\nimport ${authorizer.sessionModelName} from 'root/models/${authorizer.sessionModelName}';\n` : ''}
const ${jsonEndpointsEntry.id} = '${jsonEndpointsEntry.safeFunctionName}';

beforeAll(async done => {
  await TestHandler.beforeAll();
  done();
});

describe('${jsonEndpointsEntry.id} API', () => {
  test('', async (done) => {
    const res = await TestHandler.invokeLambda${authorizer ? '<AuthorizerContext>' : ''}(${jsonEndpointsEntry.id});
    // expect(res.statusCode).toBe(StatusCodes.OK);
    done();
  });
});

afterAll(async done => {
  await TestHandler.afterAll();
  done();
});
`;

const handlerTemplate = (
  hasPayload: boolean,
  vars: string[],
  authorizer: JsonAuthorizersEntry,
): string => `import 'module-alias/register';
import { res, StatusCodes } from '@restlessness/core';
import { Request } from './interfaces';

export default async (req: Request) => {
  try {
    const {
      validationResult,
${hasPayload ? '      payload,\n' : ''}${vars.length ? '      pathParameters,\n' : ''}${authorizer ? '      session,\n' : ''}    } = req;

    if (!validationResult.isValid) {
      return res({ message: validationResult.message }, StatusCodes.BadRequest);
    }
    
    return res({});
  } catch (e) {
    console.error(e);
    return res({}, StatusCodes.InternalServerError);
  }
};
`;

const interfacesTemplate = (
  hasPayload: boolean,
  vars: string[],
  authorizer: JsonAuthorizersEntry,
): string => `import { RequestI } from '@restlessness/core';
${authorizer ? `import ${authorizer.sessionModelName} from 'root/models/${authorizer.sessionModelName}';\n` : ''}
export interface QueryStringParameters {}${hasPayload
  ? '\n\nexport interface Payload {}' : ''}${vars.length ? `\n\nexport interface PathParameters {
${vars.map(v => `  ${v}: string,`).join('\n')}
}`
  : ''}

export interface Request extends RequestI<QueryStringParameters, ${hasPayload ? 'Payload' : 'null'}, ${vars.length ? 'PathParameters' : 'null'}> {${authorizer ? `\n  session: ${authorizer.sessionModelName},\n` : ''}};
`;

const validationsTemplate = (hasPayload: boolean, vars: string[]): string => `import * as yup from 'yup';
import { QueryStringParameters${hasPayload ? ', Payload' : ''}${vars.length ? ', PathParameters' : ''} } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});${hasPayload ?'\nconst payloadValidations = (): YupShapeByInterface<Payload> => ({});' :''}${vars.length ? `\nconst pathParametersValidations = (): YupShapeByInterface<PathParameters> => ({\n${vars.map(v => `  ${v}: yup.string().required(),`).join('\n')}\n};)` : '' }

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),${hasPayload ?'\n  payload: yup.object().shape(payloadValidations()).noUnknown(),' :''}${vars.length ? '\n  pathParameters: yup.object().shape(pathParametersValidations()),' : '' }
});

`;

const exporterTemplate = (
  jsonEndpointsEntries: JsonEndpointsEntry[],
  methods: string[],
  routes: Route[],
) => `import 'module-alias/register';
${jsonEndpointsEntries.map((jsonEndpointsEntry, index) => `import ${jsonEndpointsEntry.safeFunctionName} from 'root/endpoints/${methods[index]}-${routes[index].folderName}';`).join('\n')}

export {
  ${jsonEndpointsEntries.map(jsonEndpointsEntry => `${jsonEndpointsEntry.safeFunctionName},`).join('\n  ')}
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
