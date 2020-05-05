import { HttpMethod } from 'root/models/Endpoint';

export interface Payload {
  route: string,
  method: HttpMethod,
  authId: string
}

export interface Request {
  payload: Payload
}
