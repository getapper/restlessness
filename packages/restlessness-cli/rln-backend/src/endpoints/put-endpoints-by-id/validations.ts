import * as yup from 'yup';
import { QueryStringParameters, Payload, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});
const payloadValidations = (): YupShapeByInterface<Payload> => ({
  warmupEnabled: yup.boolean().required(),
  authorizerId: yup.string().nullable(),
  serviceName: yup.string().required(),
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

