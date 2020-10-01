import {
  ActionCreatorWithPreparedPayload,
  createAction,
  PrepareAction,
} from "@reduxjs/toolkit";
import { Action } from "redux";

enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

interface ApiRequestPayloadBuilderParams {
  path: string;
  method: HttpMethod;
  body?: any;
  query?: any;
}

interface ApiRequestPayloadBuilderOptions {
  requestDelay: number;
}

export interface ApiRequestPayloadType {
  params: ApiRequestPayloadBuilderParams;
  options?: ApiRequestPayloadBuilderOptions;
}

const apiRequestPayloadBuilder = (
  params: ApiRequestPayloadBuilderParams,
  options?: ApiRequestPayloadBuilderOptions
): ApiRequestPayloadType => ({
  params,
  options,
});

export interface ApiRequestAction extends Action<string> {
  payload: ApiRequestPayloadType;
  retry?: boolean;
}

interface ApiActionRequest<Args extends unknown[]>
  extends ActionCreatorWithPreparedPayload<Args, ApiRequestPayloadType> {}

interface ApiSuccessData<T> {
  status: number;
  data: T;
}

export interface ApiSuccessAction<T> extends Action {
  payload: ApiSuccessData<T>;
}

interface ApiFailData {
  status: number;
  message: string;
}

export interface ApiFailAction extends Action {
  payload: ApiFailData;
}

const apiActionBuilder = <ApiRequestParams, ApiResponseData>(
  api: string,
  prepare: PrepareAction<ApiRequestPayloadType>
) => ({
  api,
  request: createAction(`${api}/request`, prepare) as ApiActionRequest<
    [ApiRequestParams, ApiRequestPayloadBuilderOptions?]
  >,
  success: createAction(
    `${api}/success`,
    (payload: ApiSuccessData<ApiResponseData>) => ({
      payload,
    })
  ),
  fail: createAction(`${api}/fail`, (payload: ApiFailData) => ({
    payload,
  })),
  cancel: createAction(`${api}/cancel`),
});

export interface PatchTokensApiParams {
  idToken: string;
  refreshToken: string;
}
export interface PatchTokensApiResponseData {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}
export const patchTokensApi = apiActionBuilder<
  PatchTokensApiParams,
  PatchTokensApiResponseData
>(
  "apis/tokens/patch",
  (
    params: PatchTokensApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/tokens",
        method: HttpMethod.PATCH,
        body: {
          ...params,
        },
      },
      options
    ),
  })
);
