import {
  StatusCodes,
  ResponseOptions,
} from './interfaces';

const res = (response, statusCode:StatusCodes = StatusCodes.OK, options?: ResponseOptions) => ({
  statusCode,
  body: JSON.stringify(response),
  headers: options?.headers,
});

export {
  res,
};
export * from './interfaces';
