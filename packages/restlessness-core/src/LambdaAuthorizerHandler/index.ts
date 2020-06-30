import { AuthPolicy, AuthPolicyResponse } from './AuthPolicy';
import { AuthorizerResult, AuthorizerEvent } from '@restlessness/utilities';

export * from './AuthPolicy';

function generatePolicy(event: AuthorizerEvent, authResult: AuthorizerResult) {
  const UNAUTHORIZED = 'Unauthorized';
  try {
    if (authResult.granted) {
      const principalId: string = authResult.principalId;

      // you can send a 401 Unauthorized response to the client by failing like so:
      // callback("Unauthorized", null);

      // if the token is valid, a policy must be generated which will allow or deny access to the client

      // if access is denied, the client will receive a 403 Access Denied response
      // if access is allowed, API Gateway will proceed with the backend integration configured on the method that was called

      // this function must generate a policy that is associated with the recognized principal user identifier.
      // depending on your use case, you might store policies in a DB, or generate them on the fly

      // keep in mind, the policy is cached for 5 minutes by default (TTL is configurable in the authorizer)
      // and will apply to subsequent calls to any method/resource in the RestApi
      // made with the same token

      // by default we allow access to all resources in the RestApi
      const policy = new AuthPolicy(principalId, event.methodArn);
      policy.allowAllMethods();
      const authResponse = policy.build();

      // new! -- add additional key-value pairs
      // these are made available by APIGW like so: $context.authorizer.<key>
      // additional context is cached
      authResponse.context = {
        serializedSession : authResult.serializedSession,
      };

      return authResponse;
    } else {
      return UNAUTHORIZED;
    }
  } catch {
    return UNAUTHORIZED;
  }
}

export const LambdaAuthorizerHandler = async (event: AuthorizerEvent, checkSession: (event: AuthorizerEvent) => Promise<AuthorizerResult>): Promise<string | AuthPolicyResponse> => {
  // @TODO check cloud provider

  // const data: AuthorizerData = getPayloadQueryHeaders(awsEvent);
  const result: AuthorizerResult = await checkSession(event);

  // generate policy by serializedSession and by cloud type
  return generatePolicy(event, result);
};
