import { HttpMethod } from 'root/models/Endpoint';

export interface Payload {
  route: string,
  method: HttpMethod,
  authorizerId: string
}

export interface Request {
  payload: Payload
}
