import {
  HttpHeader,
  StatusCodes,
  ResponseOptions,
  Response,
} from './interfaces';
import path from 'path';

const res = (response, statusCode:StatusCodes = StatusCodes.OK, options?: ResponseOptions): Response => {
  const headers: HttpHeader = {};
  try {
    const defaultHeaders = require(path.join(process.cwd(), 'default-headers.json'));
    Object.assign(headers, defaultHeaders);
  } catch (e) {}
  if (options?.headers) {
    Object.assign(headers, options?.headers);
  }
  return {
    statusCode,
    body: JSON.stringify(response),
    headers,
  };
};

export {
  res,
};
export * from './interfaces';
