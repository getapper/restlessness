import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  putInfosApi,
  getInfosApi,
  PutInfosApiParams,
  PutInfosApiResponseData,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getInfos } from "../../redux-store/slices/info/selectors";
import { regions } from "../../redux-store/slices/info/interfaces";

const useInfosDetails = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      infosEdit: {
        root: classes.infosEdit,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const [payloadData, setPayloadData] = useState<PutInfosApiParams>({});
  const isLoadingInfos = useSelector(getAjaxIsLoadingByApi(getInfosApi.api));
  const isSaving = useSelector(getAjaxIsLoadingByApi(putInfosApi.api));
  const infos = useSelector(getInfos);

  const isLoading = useMemo(() => isLoadingInfos || isSaving, [
    isLoadingInfos,
    isSaving,
  ]);

  const onRegionChange = useCallback(
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode
    ) => {
      setPayloadData({
        ...payloadData,
        region: event.target.value as string,
      });
    },
    [payloadData]
  );

  const onOrganizationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        organization: event.target.value,
      });
    },
    [payloadData]
  );

  const onAppChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        app: event.target.value,
      });
    },
    [payloadData]
  );

  const onSave = useCallback(() => {
    dispatch(putInfosApi.request(payloadData));
  }, [dispatch, payloadData]);

  useEffect(() => {
    dispatch(getInfosApi.request({}));
  }, [dispatch]);

  useEffect(() => {
    setPayloadData({
      organization: infos?.organization,
      app: infos?.app,
      region: infos?.region,
    });
  }, [infos]);

  return {
    classes,
    derivedClasses,
    payloadData,
    isLoading,
    regions,
    onRegionChange,
    onOrganizationChange,
    onAppChange,
    onSave,
  };
};

export default useInfosDetails;
