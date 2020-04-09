import { HttpMethod } from 'root/models/Endpoint';

export interface Payload {
  route: string,
  method: HttpMethod,
  authId: number
}

export interface Request {
  payload: Payload
}
