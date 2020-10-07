import { RequestI } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  name: string
}

export interface Request extends RequestI<QueryStringParameters, Payload, null> {};
