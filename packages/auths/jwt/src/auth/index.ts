import jwt from 'jsonwebtoken';
import path from 'path';

interface AuthResult {
  granted: boolean,
  serializedSession?: any,
  principalId?: string,
}

interface AuthorizerEvent {
  authorizationToken: string,
  methodArn: string,
}

interface APIOptions {
  region?: string,
  restApiId?: string,
  stage?: string,
}

interface AuthPolicyMethod {
  resourceArn?: string,
  conditions?: string[]
}

interface AuthPolicyStatement {
  Action?: string,
  Effect?: string,
  Resource?: any[],
  Condition?: string
}

interface AuthPolicyDocument {
  Version?: string,
  Statement?: AuthPolicyStatement[],
}

interface AuthPolicyResponse {
  principalId: string,
  policyDocument: any,
  context?: any,
}

const UNAUTHORIZED = 'Unauthorized';

/**
 * AuthPolicy receives a set of allowed and denied methods and generates a valid
 * AWS policy for the API Gateway authorizer. The constructor receives the calling
 * user principal, the AWS account ID of the API owner, and an apiOptions object.
 * The apiOptions can contain an API Gateway RestApi Id, a region for the RestApi, and a
 * stage that calls should be allowed/denied for. For example
 * {
 *   restApiId: "xxxxxxxxxx",
 *   region: "us-east-1",
 *   stage: "dev"
 * }
 *
 * let testPolicy = new AuthPolicy("[principal user identifier]", "[AWS account id]", apiOptions);
 * testPolicy.allowMethod(AuthPolicy.HttpVerb.GET, "/users/username");
 * testPolicy.denyMethod(AuthPolicy.HttpVerb.POST, "/pets");
 * context.succeed(testPolicy.build());
 *
 * @class AuthPolicy
 * @constructor
 */
class AuthPolicy {
  awsAccountId: string
  principalId: string
  version: string
  pathRegex: RegExp
  restApiId: string
  region: string
  stage: string
  allowMethods: AuthPolicyMethod[]
  denyMethods: AuthPolicyMethod[]

  constructor (principalId: string, methodArn: string) {
    const tmp = methodArn.split(':');
    const apiGatewayArnTmp = tmp[5].split('/');
    const awsAccountId = tmp[4];
    const apiOptions: APIOptions = {
      region: tmp[3],
      restApiId: apiGatewayArnTmp[0],
      stage: apiGatewayArnTmp[1],
    };
    /*
    const method = apiGatewayArnTmp[2];
    let resource = '/'; // root resource
    if (apiGatewayArnTmp[3]) {
      resource += apiGatewayArnTmp.slice(3, apiGatewayArnTmp.length).join('/');
    }
     */

    /**
     * The AWS account id the policy will be generated for. This is used to create
     * the method ARNs.
     *
     * @property awsAccountId
     * @type {String}
     */
    this.awsAccountId = awsAccountId;

    /**
     * The principal used for the policy, this should be a unique identifier for
     * the end user.
     *
     * @property principalId
     * @type {String}
     */
    this.principalId = principalId;

    /**
     * The policy version used for the evaluation. This should always be "2012-10-17"
     *
     * @property version
     * @type {String}
     * @default "2012-10-17"
     */
    this.version = '2012-10-17';

    /**
     * The regular expression used to validate resource paths for the policy
     *
     * @property pathRegex
     * @type {RegExp}
     * @default '^\/[/.a-zA-Z0-9-\*]+$'
     */
    this.pathRegex = new RegExp('^[/.a-zA-Z0-9-\*]+$');

    // these are the internal lists of allowed and denied methods. These are lists
    // of objects and each object has 2 properties: A resource ARN and a nullable
    // conditions statement.
    // the build method processes these lists and generates the approriate
    // statements for the final policy
    this.allowMethods = [];
    this.denyMethods = [];

    if (!apiOptions || !apiOptions.restApiId) {
      this.restApiId = '*';
    } else {
      this.restApiId = apiOptions.restApiId;
    }
    if (!apiOptions || !apiOptions.region) {
      this.region = '*';
    } else {
      this.region = apiOptions.region;
    }
    if (!apiOptions || !apiOptions.stage) {
      this.stage = '*';
    } else {
      this.stage = apiOptions.stage;
    }
  }

  /**
   * A set of existing HTTP verbs supported by API Gateway. This property is here
   * only to avoid spelling mistakes in the policy.
   *
   * @property HttpVerb
   * @type {Object}
   */
  static get HttpVerb() {
    return {
      GET     : 'GET',
      POST    : 'POST',
      PUT     : 'PUT',
      PATCH   : 'PATCH',
      HEAD    : 'HEAD',
      DELETE  : 'DELETE',
      OPTIONS : 'OPTIONS',
      ALL     : '*',
    };
  }

  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   *
   * @method addMethod
   * @param {String} The effect for the policy. This can only be "Allow" or "Deny".
   * @param {String} he HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {String} The resource path. For example "/pets"
   * @param {Object} The conditions object in the format specified by the AWS docs.
   * @return {void}
   */
  private addMethod(effect, verb, resource, conditions) {
    if (verb !== '*' && !AuthPolicy.HttpVerb.hasOwnProperty(verb)) {
      throw new Error('Invalid HTTP verb ' + verb + '. Allowed verbs in AuthPolicy.HttpVerb');
    }

    if (!this.pathRegex.test(resource)) {
      throw new Error('Invalid resource path: ' + resource + '. Path should match ' + this.pathRegex);
    }

    let cleanedResource = resource;
    if (resource.substring(0, 1) === '/') {
      cleanedResource = resource.substring(1, resource.length);
    }
    let resourceArn = 'arn:aws:execute-api:' +
      this.region + ':' +
      this.awsAccountId + ':' +
      this.restApiId + '/' +
      this.stage + '/' +
      verb + '/' +
      cleanedResource;

    if (effect.toLowerCase() === 'allow') {
      this.allowMethods.push({
        resourceArn: resourceArn,
        conditions: conditions,
      });
    } else if (effect.toLowerCase() === 'deny') {
      this.denyMethods.push({
        resourceArn: resourceArn,
        conditions: conditions,
      });
    }
  };

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   *
   * @method getEmptyStatement
   * @param {String} The effect of the statement, this can be "Allow" or "Deny"
   * @return {Object} An empty statement object with the Action, Effect, and Resource
   *                  properties prepopulated.
   */
  static getEmptyStatement(effect): AuthPolicyStatement {
    effect = effect.substring(0, 1).toUpperCase() + effect.substring(1, effect.length).toLowerCase();
    const statement: AuthPolicyStatement = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: [],
    };

    return statement;
  };

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   *
   * @method getStatementsForEffect
   * @param {String} The desired effect. This can be "Allow" or "Deny"
   * @param {Array} An array of method objects containing the ARN of the resource
   *                and the conditions for the policy
   * @return {Array} an array of formatted statements for the policy.
   */
  private getStatementsForEffect(effect, methods): AuthPolicyStatement[] {
    const statements: AuthPolicyStatement[] = [];

    if (methods.length > 0) {
      const statement = AuthPolicy.getEmptyStatement(effect);

      for (let i = 0; i < methods.length; i++) {
        let curMethod = methods[i];
        if (curMethod.conditions === null || curMethod.conditions.length === 0) {
          statement.Resource.push(curMethod.resourceArn);
        } else {
          const conditionalStatement = AuthPolicy.getEmptyStatement(effect);
          conditionalStatement.Resource.push(curMethod.resourceArn);
          conditionalStatement.Condition = curMethod.conditions;
          statements.push(conditionalStatement);
        }
      }

      if (statement.Resource !== null && statement.Resource.length > 0) {
        statements.push(statement);
      }
    }

    return statements;
  };

  /**
   * Adds an allow "*" statement to the policy.
   *
   * @method allowAllMethods
   */
  allowAllMethods() {
    this.addMethod( 'allow', '*', '*', null);
  }

  /**
   * Adds a deny "*" statement to the policy.
   *
   * @method denyAllMethods
   */
  denyAllMethods() {
    this.addMethod( 'deny', '*', '*', null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods for the policy
   *
   * @method allowMethod
   * @param {String} The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} The resource path. For example "/pets"
   * @return {void}
   */
  allowMethod(verb, resource) {
    this.addMethod('allow', verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods for the policy
   *
   * @method denyMethod
   * @param {String} The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} The resource path. For example "/pets"
   * @return {void}
   */
  denyMethod(verb, resource) {
    this.addMethod('deny', verb, resource, null);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method allowMethodWithConditions
   * @param {String} The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} The resource path. For example "/pets"
   * @param {Object} The conditions object in the format specified by the AWS docs
   * @return {void}
   */
  allowMethodWithConditions(verb, resource, conditions) {
    this.addMethod('allow', verb, resource, conditions);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   *
   * @method denyMethodWithConditions
   * @param {String} The HTTP verb for the method, this should ideally come from the
   *                 AuthPolicy.HttpVerb object to avoid spelling mistakes
   * @param {string} The resource path. For example "/pets"
   * @param {Object} The conditions object in the format specified by the AWS docs
   * @return {void}
   */
  denyMethodWithConditions(verb, resource, conditions) {
    this.addMethod('deny', verb, resource, conditions);
  }

  /**
   * Generates the policy document based on the internal lists of allowed and denied
   * conditions. This will generate a policy with two main statements for the effect:
   * one statement for Allow and one statement for Deny.
   * Methods that includes conditions will have their own statement in the policy.
   *
   * @method build
   * @return {Object} The policy object that can be serialized to JSON.
   */
  build(): AuthPolicyResponse {
    if ((!this.allowMethods || this.allowMethods.length === 0) &&
      (!this.denyMethods || this.denyMethods.length === 0)) {
      throw new Error('No statements defined for the policy');
    }

    const policyDocument: AuthPolicyDocument = {
      Version: this.version,
      Statement: []
        .concat(this.getStatementsForEffect('Allow', this.allowMethods))
        .concat(this.getStatementsForEffect('Deny', this.denyMethods)),
    };

    const policy: AuthPolicyResponse = {
      principalId: this.principalId,
      policyDocument,
    };

    return policy;
  }
};

interface JwtSessionData {
  id: string,
  serializedSession: string,
};

const validateJwt = async (event: AuthorizerEvent): Promise<AuthResult> => {
  const authResult: AuthResult = {
    granted: false,
  };

  try {
    const token = event?.authorizationToken?.split(' ')?.[1] ?? null;
    if (token !== null) {
      const config = require(path.join(process.cwd(), 'env.json'));
      const jwtSecret = config?.jwt?.secret ?? null;
      const jwtUnsigned: any = jwt.verify(token, jwtSecret);
      if (jwtUnsigned.serializedSession && jwtUnsigned.id) {
        const jwtSessionData: JwtSessionData = {
          id: jwtUnsigned.id,
          serializedSession: jwtUnsigned.serializedSession,
        };
        authResult.serializedSession = jwtSessionData.serializedSession;
        authResult.granted = true;
        authResult.principalId = jwtSessionData.id;
      }
    }
  } catch (e) {
    authResult.granted = false;
  } finally {
    return authResult;
  }
};

const authorizer = async (event: AuthorizerEvent): Promise<string | AuthPolicyResponse> => {
  try {
    const authResult: AuthResult = await validateJwt(event);
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
  } catch (e) {
    return UNAUTHORIZED;
  }
};

export interface SessionModelInterface<T> {
  deserialize: (string) => Promise<T>
}

export interface SessionModelInstance {
  id: string,
  serialize: () => Promise<string>,
}

export interface AuthorizerContext {
  principalId: string,
  serializedSession: string,
}

const sessionParser = async<T>(sessionModel: SessionModelInterface<T>, event: AWSLambda.APIGatewayProxyEventBase<AuthorizerContext>, context: AWSLambda.Context): Promise<T> => {
  const session: T = await sessionModel.deserialize(event?.requestContext?.authorizer?.serializedSession);
  return session;
};

const createToken = async(session: SessionModelInstance): Promise<string> => {
  const config = require(path.join(process.cwd(), 'env.json'));
  const jwtSecret = config?.jwt?.secret ?? null;
  const sessionString = await session.serialize();
  return jwt.sign({
    id: session.id,
    serializedSession: sessionString,
  }, jwtSecret);
};

const createAuthorizer = async(session: SessionModelInstance): Promise<AuthorizerContext> => ({
  principalId: session.id,
  serializedSession: await session.serialize(),
});

export {
  authorizer,
  createToken,
  createAuthorizer,
};

export {
  sessionParser,
};
