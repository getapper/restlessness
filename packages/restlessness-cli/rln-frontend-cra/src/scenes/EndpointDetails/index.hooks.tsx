import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getAuthorizersApi,
  getDaosApi,
  getEndpointsApi,
  getServicesApi,
  HttpMethod,
  putEndpointByEndpointIdsApi,
  PutEndpointsByEndpointIdApiPayload,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getEndpointsList } from "../../redux-store/slices/endpoint/selectors";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAuthorizersList } from "../../redux-store/slices/authorizer/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getServicesList } from "../../redux-store/slices/service/selectors";

interface RouteParams {
  endpointId: string;
}

const useEndpointDetails = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      endpointEdit: {
        root: classes.endpointEdit,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const params = useParams<RouteParams>();
  const endpointsList = useSelector(getEndpointsList);
  const daosList = useSelector(getDaosList);
  const authorizersList = useSelector(getAuthorizersList);
  const servicesList = useSelector(getServicesList);
  const [payloadData, setPayloadData] = useState<
    PutEndpointsByEndpointIdApiPayload
  >({
    warmupEnabled: false,
    authorizerId: null,
    daoIds: [],
    serviceName: null,
  });
  const isLoadingEndpoints = useSelector(
    getAjaxIsLoadingByApi(getEndpointsApi.api)
  );
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isLoadingAuthorizers = useSelector(
    getAjaxIsLoadingByApi(getAuthorizersApi.api)
  );
  const isLoadingServices = useSelector(
    getAjaxIsLoadingByApi(getServicesApi.api)
  );
  const isSaving = useSelector(
    getAjaxIsLoadingByApi(putEndpointByEndpointIdsApi.api)
  );

  const endpointData = useMemo(
    () => endpointsList?.find((endpoint) => endpoint.id === params.endpointId),
    [endpointsList, params]
  );

  const isLoading = useMemo(
    () =>
      isLoadingAuthorizers ||
      isLoadingEndpoints ||
      isLoadingDaos ||
      isLoadingServices ||
      isSaving,
    [
      isLoadingAuthorizers,
      isLoadingDaos,
      isLoadingEndpoints,
      isLoadingServices,
      isSaving,
    ]
  );

  const onWarmUpChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setPayloadData({
        ...payloadData,
        warmupEnabled: checked,
      });
    },
    [payloadData]
  );

  const onServiceChange = useCallback(
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode
    ) => {
      setPayloadData({
        ...payloadData,
        serviceName: event.target.value as string,
      });
    },
    [payloadData]
  );

  const onSave = useCallback(() => {
    if (endpointData?.id) {
      dispatch(
        putEndpointByEndpointIdsApi.request({
          endpointId: endpointData.id,
          endpointData: payloadData,
        })
      );
    }
  }, [dispatch, endpointData, payloadData]);

  useEffect(() => {
    dispatch(getEndpointsApi.request({}));
    dispatch(getAuthorizersApi.request({}));
    dispatch(getDaosApi.request({}));
    dispatch(getServicesApi.request({}));
  }, [dispatch]);

  useEffect(() => {
    setPayloadData({
      warmupEnabled: endpointData?.warmupEnabled ?? false,
      daoIds: endpointData?.daos?.map((d) => d.id) ?? [],
      authorizerId: endpointData?.authorizer?.id ?? null,
      serviceName: endpointData?.serviceName ?? null,
    });
  }, [endpointData]);

  return {
    classes,
    derivedClasses,
    endpointData,
    daosList,
    authorizersList,
    servicesList,
    payloadData,
    isLoading,
    onWarmUpChange,
    onServiceChange,
    onSave,
  };
};

export default useEndpointDetails;
