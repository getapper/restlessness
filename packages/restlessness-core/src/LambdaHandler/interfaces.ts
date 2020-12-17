import * as yup from 'yup';

export interface ValidationObjects {
  queryStringParameters?: yup.Schema<object>,
  payload?: yup.Schema<object>,
  pathParameters?: yup.Schema<object>,
}

export interface ValidationResult {
  isValid: boolean,
  queryStringParametersErrors?: yup.ValidationError,
  payloadErrors?: yup.ValidationError,
  pathParametersErrors?: yup.ValidationError,
  message?: string,
}

export type YupShapeByInterface<T> = {
  [K in keyof T]: any;
}

export interface RequestI<Q, P, PP> {
  validationResult: ValidationResult,
  queryStringParameters: Q,
  payload: P,
  pathParameters: PP,
  session?: any
  headers?: { [name: string]: string }
}
