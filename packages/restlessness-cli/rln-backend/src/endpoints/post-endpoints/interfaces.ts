import { HttpMethod } from '@restlessness/utilities';

export interface Payload {
  route: string,
  method: HttpMethod,
  authorizerId: string
}

export interface Request {
  payload: Payload
}
