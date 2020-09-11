import * as yup from 'yup';
import { QueryStringParameters, Payload, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});
const payloadValidations = (): YupShapeByInterface<Payload> => ({
  route: yup.string(),
  warmupEnabled: yup.boolean(),
  method: yup.string(),
  authorizerId: yup.string().nullable(),
  daoIds: yup.array().of(yup.string()).nullable(),
});
const pathParametersValidations = (): YupShapeByInterface<PathParameters> => ({
  id: yup.string().required(),
});

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),
  payload: yup.object().shape(payloadValidations()).noUnknown(),
  pathParameters: yup.object().shape(pathParametersValidations()),
});

