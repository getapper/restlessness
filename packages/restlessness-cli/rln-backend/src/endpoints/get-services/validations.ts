import * as yup from 'yup';
import { QueryStringParameters } from './interfaces';
import { YupShapeByInterface } from '@restlessness/core';

const queryStringParametersValidations = (): YupShapeByInterface<QueryStringParameters>  => ({});

export default () => ({
  queryStringParameters: yup.object().shape(queryStringParametersValidations()),
});

