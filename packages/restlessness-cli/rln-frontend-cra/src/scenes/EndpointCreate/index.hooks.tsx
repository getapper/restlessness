import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getAuthorizersApi,
  getDaosApi,
  getEndpointsApi,
  getServicesApi,
  HttpMethod,
  postEndpointsApi,
  PostEndpointsApiParams,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAuthorizersList } from "../../redux-store/slices/authorizer/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getServicesList } from "../../redux-store/slices/service/selectors";

interface RouteParams {
  endpointId: string;
}

const useEndpointCreate = () => {
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
  const daosList = useSelector(getDaosList);
  const authorizersList = useSelector(getAuthorizersList);
  const servicesList = useSelector(getServicesList);
  const [payloadData, setPayloadData] = useState<PostEndpointsApiParams>({
    warmupEnabled: false,
    authorizerId: null,
    daoIds: [],
    route: "",
    method: HttpMethod.PUT,
    serviceName: null,
  });
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isLoadingServices = useSelector(
    getAjaxIsLoadingByApi(getServicesApi.api)
  );
  const isLoadingAuthorizers = useSelector(
    getAjaxIsLoadingByApi(getAuthorizersApi.api)
  );
  const isSaving = useSelector(getAjaxIsLoadingByApi(postEndpointsApi.api));

  const isLoading = useMemo(
    () =>
      isLoadingAuthorizers || isLoadingDaos || isLoadingServices || isSaving,
    [isLoadingAuthorizers, isLoadingDaos, isLoadingServices, isSaving]
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

  const onRouteChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        route: event.target.value,
      });
    },
    [payloadData]
  );

  const onMethodChange = useCallback(
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode
    ) => {
      setPayloadData({
        ...payloadData,
        method: event.target.value as HttpMethod,
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
    dispatch(postEndpointsApi.request(payloadData));
  }, [dispatch, payloadData]);

  useEffect(() => {
    dispatch(getEndpointsApi.request({}));
    dispatch(getAuthorizersApi.request({}));
    dispatch(getDaosApi.request({}));
    dispatch(getServicesApi.request({}));
  }, [dispatch]);

  return {
    classes,
    derivedClasses,
    daosList,
    authorizersList,
    servicesList,
    payloadData,
    isLoading,
    onWarmUpChange,
    onRouteChange,
    onMethodChange,
    onServiceChange,
    onSave,
  };
};

export default useEndpointCreate;
