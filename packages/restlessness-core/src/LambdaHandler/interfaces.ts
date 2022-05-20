import * as yup from 'yup';

export interface ValidationObjects {
  queryStringParameters?: yup.SchemaOf<object>,
  payload?: yup.SchemaOf<object>,
  pathParameters?: yup.SchemaOf<object>,
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
