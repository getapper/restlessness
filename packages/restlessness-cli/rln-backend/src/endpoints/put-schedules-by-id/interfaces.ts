import { RequestI, HttpMethod } from '@restlessness/core';
import { RateUnit } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Payload {
  description: string,
  rateNumber: number,
  rateUnit: RateUnit
  daoIds: string[]
  serviceName: string
  enabled: boolean
}

export interface PathParameters {
  id: string,
}

export interface Request extends RequestI<QueryStringParameters, Payload, PathParameters> {};
