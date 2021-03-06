import { HttpMethod } from '../JsonEndpoints';

export interface Functions {
  [key: string]: FunctionEndpoint
}

export interface Event {
  http?: {
    path: string,
    method: HttpMethod,
    cors: boolean,
    authorizer?: string | { [key: string]: any }
  }
  schedule?: {
    name: string,
    description?: string,
    rate: string,
    enabled: boolean,
    input?: { [key: string]: any}
    inputPath?: { [key: string]: any}
    inputTransformer?: { [key: string]: any}
  }
}

export interface FunctionEndpoint {
  handler: string,
  events?: Event[],
  warmup?: { [key: string]: any, enabled: boolean }
}

export interface JsonServerless {
  org?: string
  app?: string
  service: string
  provider: { [key: string]: any }
  resources: { [key: string]: any }
  plugins: string[]
  functions: Functions
}
