const jwtAuthorizerTemplate = (): string => `import jwt from 'jsonwebtoken';
const config = require('../../config.json');

const jwtSecret = config.jwt.secret;

const generatePolicy = (principalId, effect, resource) => {
  const authResponse: any = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument: any = {};
    policyDocument.Version = '2012-10-17';
    policyDocument.Statement = [];
    const statementOne: any = {};
    statementOne.Action = 'execute-api:Invoke';
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};

const auth = async (event, context) => {
  let isValid;
  const token = event.authorizationToken.split(' ') [1];

  try {
    const session = jwt.verify(token,jwtSecret);
    if (session) {
      context.session = session;
      isValid = true;
    } else {
      isValid = false;
    }
  } catch (e) {
    isValid = false;
  } finally {
    return {
      isValid,
    };
  }
};

const authorizer = (event, context, callback) => {
  auth(event, context)
    .then(result => {
      if (result.isValid) {
        return callback(null, generatePolicy(context.session.id,  'Allow', event.methodArn));
      } else {
        return callback(null, 'Unauthorized');
      }
    })
    .catch(err => {
      return callback(null, 'Unauthorized');
    });
};

export {
  authorizer
}
`;

export {
  jwtAuthorizerTemplate,
};
