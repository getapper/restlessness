import { ValidationResult } from '@restlessness/core';

export interface QueryStringParameters {}

export interface Request {
  validationResult: ValidationResult,
  queryStringParameters: QueryStringParameters,
}
