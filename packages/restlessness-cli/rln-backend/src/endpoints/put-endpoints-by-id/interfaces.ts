import { RequestI, HttpMethod } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  route: string,
  method: HttpMethod,
  authorizerId: string
  daoIds: string[]
  warmupEnabled: boolean
}

export interface PathParameters {
  id: string,
}

export interface Request extends RequestI<QueryStringParameters, Payload, PathParameters> {};
