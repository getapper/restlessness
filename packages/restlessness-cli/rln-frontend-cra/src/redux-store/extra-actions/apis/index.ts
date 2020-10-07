import {
  ActionCreatorWithPreparedPayload,
  createAction,
  PrepareAction,
} from "@reduxjs/toolkit";
import { Action } from "redux";
import { Endpoint } from "../../slices/endpoint/interfaces";
import { Dao } from "../../slices/dao/interfaces";
import { Authorizer } from "../../slices/authorizer/interfaces";

export enum HttpMethod {
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

export type ApiID = string;

const apiActionBuilder = <ApiRequestParams, ApiResponseData>(
  api: ApiID,
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

export interface GetEndpointsApiParams {}
export interface GetEndpointsResponseData {
  endpoints: Endpoint[];
}
export const getEndpointsApi = apiActionBuilder<
  GetEndpointsApiParams,
  GetEndpointsResponseData
>(
  "apis/endpoints/get",
  (
    params: GetEndpointsApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/endpoints",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface GetDaosApiParams {}
export interface GetDaosResponseData {
  daos: Dao[];
}
export const getDaosApi = apiActionBuilder<
  GetDaosApiParams,
  GetDaosResponseData
>(
  "apis/daos/get",
  (params: GetDaosApiParams, options?: ApiRequestPayloadBuilderOptions) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/daos",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface GetAuthorizersApiParams {}
export interface GetAuthorizersResponseData {
  authorizers: Authorizer[];
}
export const getAuthorizersApi = apiActionBuilder<
  GetAuthorizersApiParams,
  GetAuthorizersResponseData
>(
  "apis/authorizers/get",
  (
    params: GetAuthorizersApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/authorizers",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface PutEndpointsByEndpointIdApiPayload {
  route: string;
  method: HttpMethod;
  authorizerId: string | null;
  daoIds: string[];
  warmupEnabled: boolean;
}
export interface PutEndpointsByEndpointIdApiParams {
  endpointId: string;
  endpointData: PutEndpointsByEndpointIdApiPayload;
}
export interface PutEndpointsByEndpointIdResponseData {
  endpoint: Endpoint[];
}
export const putEndpointByEndpointIdsApi = apiActionBuilder<
  PutEndpointsByEndpointIdApiParams,
  PutEndpointsByEndpointIdResponseData
>(
  "apis/endpoints/{endpointId}/put",
  (
    params: PutEndpointsByEndpointIdApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: `/endpoints/${params.endpointId}`,
        method: HttpMethod.PUT,
        body: params.endpointData,
      },
      options
    ),
  })
);

export interface PostEndpointsApiParams {
  route: string | null;
  method: HttpMethod;
  authorizerId: string | null;
  daoIds: string[];
  warmupEnabled: boolean;
  serviceId: string | null;
}
export interface PostEndpointsResponseData {
  endpoint: Endpoint[];
}
export const postEndpointsApi = apiActionBuilder<
  PostEndpointsApiParams,
  PostEndpointsResponseData
>(
  "apis/endpoints/post",
  (
    params: PostEndpointsApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: `/endpoints`,
        method: HttpMethod.POST,
        body: params,
      },
      options
    ),
  })
);
