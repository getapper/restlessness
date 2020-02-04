import { HttpMethod } from 'root/models/Endpoint';

export interface Payload {
  route: string,
  method: HttpMethod
}

export interface Request {
  payload: Payload
}
