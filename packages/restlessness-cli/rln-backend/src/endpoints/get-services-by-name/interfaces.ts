import { RequestI } from '@restlessness/core';

export interface QueryStringParameters {}

export interface PathParameters {
  name: string,
}

export interface Request extends RequestI<QueryStringParameters, null, PathParameters> {};
