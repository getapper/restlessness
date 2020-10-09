import { RequestI, HttpMethod } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  authorizerId: string
  daoIds: string[]
  warmupEnabled: boolean
  serviceName: string
}

export interface PathParameters {
  id: string,
}

export interface Request extends RequestI<QueryStringParameters, Payload, PathParameters> {};
