import { RequestI } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  serviceName
}

export interface PathParameters {
  name: string,
}

export interface Request extends RequestI<QueryStringParameters, Payload, PathParameters> {};
