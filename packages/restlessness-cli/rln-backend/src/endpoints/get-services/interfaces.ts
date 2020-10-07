import { RequestI } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Request extends RequestI<QueryStringParameters, null, null> {};
