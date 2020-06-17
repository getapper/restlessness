import * as yup from 'yup';
import { QueryStringParameters, PathParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations: YupShapeByInterface<QueryStringParameters> = {};
const pathParametersValidations: YupShapeByInterface<PathParameters> = {
  id: yup.string().required(),
};

export default {
  queryStringParameters: yup.object().shape(queryStringParametersValidations),
  pathParameters: yup.object().shape(pathParametersValidations),
};

