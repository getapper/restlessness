import {
  HttpHeader,
  StatusCodes,
  ResponseOptions,
  Response,
} from './interfaces';
import { PathResolver } from '@restlessness/utilities';

class ResponseHandler {
  static json (response, statusCode: StatusCodes = StatusCodes.OK, options?: ResponseOptions): Response {
    const headers: HttpHeader = {};
    try {
      const defaultHeaders = require(PathResolver.getDefaultHeadersConfigPath);
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
  }
}

export {
  ResponseHandler,
};
export * from './interfaces';
