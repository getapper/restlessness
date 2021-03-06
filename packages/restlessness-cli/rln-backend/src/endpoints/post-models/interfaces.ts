export interface QueryStringParameters {}

export interface Payload {
  daoId: string
  name: string
}

export interface Request {
  queryStringParameters: QueryStringParameters,
  payload: Payload,
}
