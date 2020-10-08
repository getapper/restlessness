import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getAuthorizersApi,
  getDaosApi,
  getModelsApi,
  getServicesApi,
  HttpMethod,
  postModelsApi,
  PostModelsApiParams,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAuthorizersList } from "../../redux-store/slices/authorizer/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getServicesList } from "../../redux-store/slices/service/selectors";

const useModelCreate = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      modelEdit: {
        root: classes.modelEdit,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const daosList = useSelector(getDaosList);
  const authorizersList = useSelector(getAuthorizersList);
  const servicesList = useSelector(getServicesList);
  const [payloadData, setPayloadData] = useState<PostModelsApiParams>({
    daoId: null,
    name: "",
  });
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isSaving = useSelector(getAjaxIsLoadingByApi(postModelsApi.api));

  const isLoading = useMemo(() => isLoadingDaos || isSaving, [
    isLoadingDaos,
    isSaving,
  ]);

  const onNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        name: event.target.value,
      });
    },
    [payloadData]
  );

  const onDaoChange = useCallback(
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode
    ) => {
      setPayloadData({
        ...payloadData,
        daoId: event.target.value as string,
      });
    },
    [payloadData]
  );

  const onSave = useCallback(() => {
    dispatch(postModelsApi.request(payloadData));
  }, [dispatch, payloadData]);

  useEffect(() => {
    dispatch(getDaosApi.request({}));
  }, [dispatch]);

  return {
    classes,
    derivedClasses,
    daosList,
    authorizersList,
    servicesList,
    payloadData,
    isLoading,
    onNameChange,
    onDaoChange,
    onSave,
  };
};

export default useModelCreate;
