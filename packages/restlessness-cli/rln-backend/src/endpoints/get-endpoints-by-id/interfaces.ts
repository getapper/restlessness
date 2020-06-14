import { RequestI } from '@restlessness/core';

export interface QueryStringParameters {}

export interface PathParameters {
  id: string,
}

export interface Request extends RequestI<QueryStringParameters, null, PathParameters> {};
