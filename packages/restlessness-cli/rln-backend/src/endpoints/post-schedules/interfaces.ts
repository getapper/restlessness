import { RateUnit } from '@restlessness/core';

export interface Payload {
  name: string,
  description: string,
  rateNumber: number,
  rateUnit: RateUnit
  daoIds: string[]
  serviceName: string
}

export interface Request {
  payload: Payload
}
