import AddOnPackage from '../AddOnPackage';

export interface AuthorizerEvent {
  headers?: { [key: string]: string },
  pathParameters?: { [name: string]: string } | null,
  queryStringParameters?: { [name: string]: string } | null,
  body?: any, // @TODO verify if present
  authorizationToken?: string,
  methodArn?: string,
  type: 'TOKEN' | 'REQUEST'
}

export interface AuthorizerResult {
  granted: boolean,
  serializedSession?: any,
  principalId?: string,
}

export default abstract class AuthorizerPackage extends AddOnPackage {
  abstract authorizer(event: AuthorizerEvent): any // @TODO change any to generic policy
  abstract get authorizerPath(): string // @TODO alternative: look for packageJson.main as entry point
  abstract parseSession(session: string): Promise<any>
}
