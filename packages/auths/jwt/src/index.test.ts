import Jwt, { authorizer } from './';
import { AuthorizerEvent, AuthPolicyResponse } from '@restlessness/core';

describe('Jwt Authorizer', () => {
  process.env['RLN_AUTH_JWT_SECRET'] = 'secret_test';
  const session = {
    id: 'test_id',
    serialize: async () => JSON.stringify(session),
  };

  test('Token creation', async (done) => {
    const token = await Jwt.createToken(session);
    expect(token).toBeDefined();
    done();
  });

  test('Token verification', async (done) => {
    const token = await Jwt.createToken(session);
    const authorizerEvent: AuthorizerEvent = {
            type: 'TOKEN',
            authorizationToken: `Bearer ${token}`,
            methodArn: 'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/route_test',
    };
    const authResult = await Jwt.verifyToken(authorizerEvent);
    expect(authResult.granted).toBe(true);
    done();
  });

  test('Authorizer Function', async (done) => {
    const token = await Jwt.createToken(session);
    const authorizerEvent: AuthorizerEvent = {
      type: 'TOKEN',
      authorizationToken: `Bearer ${token}`,
      methodArn: 'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/route_test',
    };
    const authResult = await authorizer(authorizerEvent);
    expect(authResult).not.toBe('Unauthorized');
    const parsedSession = JSON.parse((authResult as AuthPolicyResponse).context.serializedSession);
    expect(parsedSession.id).toBe(session.id);
    done();
  });
});
