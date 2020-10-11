import { RequestI, HttpMethod } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  organization?: string | undefined
  app?: string | undefined
  region?: string | undefined
}

export interface PathParameters {}

export interface Request extends RequestI<QueryStringParameters, Payload, PathParameters> {};
