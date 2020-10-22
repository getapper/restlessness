import * as yup from 'yup';
import { QueryStringParameters, Payload, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});
const payloadValidations = (): YupShapeByInterface<Payload> => ({
  description: yup.string().required(),
  rateNumber: yup.number().required(),
  rateUnit: yup.string().required(),
  daoIds: yup.array().of(yup.string()).nullable(),
  enabled: yup.boolean().required(),
  serviceName: yup.string().required(),
});
const pathParametersValidations = (): YupShapeByInterface<PathParameters> => ({
  id: yup.string().required(),
});

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),
  payload: yup.object().shape(payloadValidations()).noUnknown(),
  pathParameters: yup.object().shape(pathParametersValidations()),
});

