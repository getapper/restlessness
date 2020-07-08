import AddOnPackage from '../AddOnPackage';
import { AuthPolicy, AuthPolicyResponse } from '../LambdaAuthorizerHandler/AuthPolicy';
import { AuthorizerEvent, AuthorizerResult, SessionModelInstance, SessionModelInterface } from './interfaces';

export * from './interfaces';

export abstract class AuthorizerPackage extends AddOnPackage {
  abstract createToken(session: SessionModelInstance): Promise<string>
  abstract verifyToken(event: AuthorizerEvent): Promise<AuthorizerResult>
  abstract parseSession(session: string): Promise<unknown>

  async authorizer(event: AuthorizerEvent) {
    // extract data from event
    const authResult = await this.verifyToken(event);
    return this.generatePolicy(event, authResult);
  }

  generatePolicy(event: AuthorizerEvent, authResult: AuthorizerResult): AuthPolicyResponse | 'Unauthorized' {
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
          principalId: authResult.principalId,
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
}
