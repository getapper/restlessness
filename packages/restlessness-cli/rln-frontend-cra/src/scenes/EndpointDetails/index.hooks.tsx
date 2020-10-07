import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getAuthorizersApi,
  getDaosApi,
  getEndpointsApi,
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
  const [payloadData, setPayloadData] = useState<
    PutEndpointsByEndpointIdApiPayload
  >({
    warmupEnabled: false,
    authorizerId: null,
    daoIds: [],
    route: "",
    method: HttpMethod.PUT,
  });
  const isLoadingEndpoints = useSelector(
    getAjaxIsLoadingByApi(getEndpointsApi.api)
  );
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isLoadingAuthorizers = useSelector(
    getAjaxIsLoadingByApi(getAuthorizersApi.api)
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
      isLoadingAuthorizers || isLoadingEndpoints || isLoadingDaos || isSaving,
    [isLoadingAuthorizers, isLoadingDaos, isLoadingEndpoints, isSaving]
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
  }, [dispatch]);

  useEffect(() => {
    setPayloadData({
      route: endpointData?.route ?? "",
      method: endpointData?.method ?? HttpMethod.GET,
      warmupEnabled: endpointData?.warmupEnabled ?? false,
      daoIds: endpointData?.daos?.map((d) => d.id) ?? [],
      authorizerId: endpointData?.authorizer?.id ?? null,
    });
  }, [endpointData]);

  return {
    classes,
    derivedClasses,
    endpointData,
    daosList,
    authorizersList,
    payloadData,
    isLoading,
    onWarmUpChange,
    onSave,
  };
};

export default useEndpointDetails;
