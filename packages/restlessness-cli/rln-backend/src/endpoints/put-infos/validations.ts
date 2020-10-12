import * as yup from 'yup';
import { QueryStringParameters, Payload, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});
const payloadValidations = (): YupShapeByInterface<Payload> => ({
  org: yup.string(),
  app: yup.string(),
  region: yup.string(),
});
const pathParametersValidations = (): YupShapeByInterface<PathParameters> => ({});

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),
  payload: yup.object().shape(payloadValidations()).noUnknown(),
  pathParameters: yup.object().shape(pathParametersValidations()),
});

