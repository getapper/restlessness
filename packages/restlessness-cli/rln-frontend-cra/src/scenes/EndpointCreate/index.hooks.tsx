import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getAuthorizersApi,
  getDaosApi,
  getEndpointsApi,
  HttpMethod,
  postEndpointsApi,
  PostEndpointsApiParams,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAuthorizersList } from "../../redux-store/slices/authorizer/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";

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
  const [payloadData, setPayloadData] = useState<PostEndpointsApiParams>({
    warmupEnabled: false,
    authorizerId: null,
    daoIds: [],
    route: "",
    method: HttpMethod.PUT,
    serviceId: null,
  });
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isLoadingAuthorizers = useSelector(
    getAjaxIsLoadingByApi(getAuthorizersApi.api)
  );
  const isSaving = useSelector(getAjaxIsLoadingByApi(postEndpointsApi.api));

  const isLoading = useMemo(
    () => isLoadingAuthorizers || isLoadingDaos || isSaving,
    [isLoadingAuthorizers, isLoadingDaos, isSaving]
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

  const onSave = useCallback(() => {
    dispatch(postEndpointsApi.request(payloadData));
  }, [dispatch, payloadData]);

  useEffect(() => {
    dispatch(getEndpointsApi.request({}));
    dispatch(getAuthorizersApi.request({}));
    dispatch(getDaosApi.request({}));
  }, [dispatch]);

  return {
    classes,
    derivedClasses,
    daosList,
    authorizersList,
    payloadData,
    isLoading,
    onWarmUpChange,
    onRouteChange,
    onMethodChange,
    onSave,
  };
};

export default useEndpointCreate;
