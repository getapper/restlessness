import * as yup from 'yup';
import { QueryStringParameters, Payload, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});
const payloadValidations = (): YupShapeByInterface<Payload> => ({
  serviceName: yup.string(),
});
const pathParametersValidations = (): YupShapeByInterface<PathParameters> => ({
  name: yup.string().required(),
});

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),
  payload: yup.object().shape(payloadValidations()).noUnknown(),
  pathParameters: yup.object().shape(pathParametersValidations()),
});

