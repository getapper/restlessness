export interface AuthorizerEvent {
  headers?: { [key: string]: string },
  pathParameters?: { [name: string]: string } | null,
  queryStringParameters?: { [name: string]: string } | null,
  body?: any, // @TODO verify if present
  authorizationToken?: string,
  methodArn?: string,
  type: 'TOKEN' | 'REQUEST'
}

export interface SessionModelInterface<T> {
  deserialize: (string) => Promise<T>
}

export interface SessionModelInstance {
  id: string
  serialize: () => Promise<string>,
}

export interface AuthorizerResult {
  granted: boolean,
  serializedSession?: string,
  principalId?: string,
}

export interface AuthorizerContext {
  principalId: string,
  serializedSession: string,
}
