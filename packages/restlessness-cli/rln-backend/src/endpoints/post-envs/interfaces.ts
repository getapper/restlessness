import { EnvType, EnvStage } from 'root/models/Env';

export interface QueryStringParameters {}

export interface Payload {
  name: string,
  type: EnvType,
  stage: EnvStage
}

export interface Request {
  queryStringParameters: QueryStringParameters,
  payload: Payload,
}
