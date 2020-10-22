import {
  ActionCreatorWithPreparedPayload,
  createAction,
  PrepareAction,
} from "@reduxjs/toolkit";
import { Action } from "redux";
import { Endpoint } from "../../slices/endpoint/interfaces";
import { Dao } from "../../slices/dao/interfaces";
import { Authorizer } from "../../slices/authorizer/interfaces";
import { Service } from "../../slices/service/interfaces";
import { Model } from "../../slices/model/interfaces";
import { RateUnit, Schedule } from "redux-store/slices/schedule/interfaces";

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

export interface PutEndpointsByEndpointIdApiPayload {
  authorizerId: string | null;
  daoIds: string[];
  warmupEnabled: boolean;
  serviceName: string | null;
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

export interface DeleteEndpointsByEndpointIdApiParams {
  endpointId: string;
}
export interface DeleteEndpointsByEndpointIdResponseData {}
export const deleteEndpointByEndpointIdsApi = apiActionBuilder<
  DeleteEndpointsByEndpointIdApiParams,
  DeleteEndpointsByEndpointIdResponseData
>(
  "apis/endpoints/{endpointId}/delete",
  (
    params: DeleteEndpointsByEndpointIdApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: `/endpoints/${params.endpointId}`,
        method: HttpMethod.DELETE,
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
  serviceName: string | null;
}
export interface PostEndpointsResponseData {
  endpoint: Endpoint;
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
        path: "/endpoints",
        method: HttpMethod.POST,
        body: params,
      },
      options
    ),
  })
);

export interface GetServicesApiParams {}
export interface GetServicesResponseData {
  services: Service[];
}
export const getServicesApi = apiActionBuilder<
  GetServicesApiParams,
  GetServicesResponseData
>(
  "apis/services/get",
  (
    params: GetServicesApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/services",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface PostServicesApiParams {
  name: string | null;
}
export interface PostServicesResponseData {
  service: Service;
}
export const postServicesApi = apiActionBuilder<
  PostServicesApiParams,
  PostServicesResponseData
>(
  "apis/services/post",
  (
    params: PostServicesApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/services",
        method: HttpMethod.POST,
        body: params,
      },
      options
    ),
  })
);

export interface GetModelsApiParams {}
export interface GetModelsResponseData {
  models: Model[];
}
export const getModelsApi = apiActionBuilder<
  GetModelsApiParams,
  GetModelsResponseData
>(
  "apis/models/get",
  (params: GetModelsApiParams, options?: ApiRequestPayloadBuilderOptions) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/models",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface PostModelsApiParams {
  name: string | null;
  daoId: string | null;
}
export interface PostModelsResponseData {
  model: Model;
}
export const postModelsApi = apiActionBuilder<
  PostModelsApiParams,
  PostModelsResponseData
>(
  "apis/models/post",
  (params: PostModelsApiParams, options?: ApiRequestPayloadBuilderOptions) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/models",
        method: HttpMethod.POST,
        body: params,
      },
      options
    ),
  })
);

export interface GetInfosApiParams {}
export interface GetInfosResponseData {
  projectName: string;
  org: string | undefined;
  app: string | undefined;
  region: string | undefined;
}
export const getInfosApi = apiActionBuilder<
  GetInfosApiParams,
  GetInfosResponseData
>(
  "apis/infos/get",
  (params: GetInfosApiParams, options?: ApiRequestPayloadBuilderOptions) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/infos",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface PutInfosApiParams {
  org?: string | undefined;
  app?: string | undefined;
  region?: string | undefined;
}
export interface PutInfosApiResponseData {
  org: string | undefined;
  app: string | undefined;
  region: string | undefined;
}
export const putInfosApi = apiActionBuilder<
  PutInfosApiParams,
  PutInfosApiResponseData
>(
  "apis/infos/{endpointId}/put",
  (params: PutInfosApiParams, options?: ApiRequestPayloadBuilderOptions) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/infos",
        method: HttpMethod.PUT,
        body: params,
      },
      options
    ),
  })
);

export interface GetSchedulesApiParams {}
export interface GetSchedulesResponseData {
  schedules: Schedule[];
}
export const getSchedulesApi = apiActionBuilder<
  GetSchedulesApiParams,
  GetSchedulesResponseData
>(
  "apis/schedules/get",
  (
    params: GetSchedulesApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/schedules",
        method: HttpMethod.GET,
      },
      options
    ),
  })
);

export interface PutSchedulesByScheduleIdApiPayload {
  description: string | null;
  rateNumber: number;
  rateUnit: RateUnit;
  enabled: boolean;
  daoIds: string[];
  serviceName: string | null;
}
export interface PutSchedulesByScheduleIdApiParams {
  scheduleId: string;
  scheduleData: PutSchedulesByScheduleIdApiPayload;
}
export interface PutSchedulesByScheduleIdResponseData {
  schedule: Schedule[];
}
export const putScheduleByScheduleIdsApi = apiActionBuilder<
  PutSchedulesByScheduleIdApiParams,
  PutSchedulesByScheduleIdResponseData
>(
  "apis/schedules/{scheduleId}/put",
  (
    params: PutSchedulesByScheduleIdApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: `/schedules/${params.scheduleId}`,
        method: HttpMethod.PUT,
        body: params.scheduleData,
      },
      options
    ),
  })
);

export interface DeleteSchedulesByScheduleIdApiParams {
  scheduleId: string;
}
export interface DeleteSchedulesByScheduleIdResponseData {}
export const deleteScheduleByScheduleIdsApi = apiActionBuilder<
  DeleteSchedulesByScheduleIdApiParams,
  DeleteSchedulesByScheduleIdResponseData
>(
  "apis/schedules/{scheduleId}/delete",
  (
    params: DeleteSchedulesByScheduleIdApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: `/schedules/${params.scheduleId}`,
        method: HttpMethod.DELETE,
      },
      options
    ),
  })
);

export interface PostSchedulesApiParams {
  name: string;
  description: string | null;
  rateNumber: number;
  rateUnit: RateUnit;
  daoIds: string[];
  serviceName: string | null;
}
export interface PostSchedulesResponseData {
  schedule: Schedule;
}
export const postSchedulesApi = apiActionBuilder<
  PostSchedulesApiParams,
  PostSchedulesResponseData
>(
  "apis/schedules/post",
  (
    params: PostSchedulesApiParams,
    options?: ApiRequestPayloadBuilderOptions
  ) => ({
    payload: apiRequestPayloadBuilder(
      {
        path: "/schedules",
        method: HttpMethod.POST,
        body: params,
      },
      options
    ),
  })
);
