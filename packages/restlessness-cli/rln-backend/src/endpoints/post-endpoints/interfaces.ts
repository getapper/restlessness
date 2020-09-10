import { HttpMethod } from '@restlessness/core';

export interface Payload {
  route: string,
  method: HttpMethod,
  authorizerId: string
  daoIds: string[]
  warmupEnabled: boolean
}

export interface Request {
  payload: Payload
}
