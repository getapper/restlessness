import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  getDaosApi,
  getSchedulesApi,
  getServicesApi,
  postSchedulesApi,
  PostSchedulesApiParams,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getServicesList } from "../../redux-store/slices/service/selectors";
import { RateUnit } from "redux-store/slices/schedule/interfaces";

const useScheduleCreate = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      scheduleEdit: {
        root: classes.scheduleEdit,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const daosList = useSelector(getDaosList);
  const servicesList = useSelector(getServicesList);
  const [payloadData, setPayloadData] = useState<PostSchedulesApiParams>({
    name: "",
    description: null,
    rateNumber: 5,
    rateUnit: RateUnit.MINUTES,
    daoIds: [],
    serviceName: null,
  });
  const isLoadingDaos = useSelector(getAjaxIsLoadingByApi(getDaosApi.api));
  const isLoadingServices = useSelector(
    getAjaxIsLoadingByApi(getServicesApi.api)
  );
  const isSaving = useSelector(getAjaxIsLoadingByApi(postSchedulesApi.api));

  const isLoading = useMemo(
    () => isLoadingDaos || isLoadingServices || isSaving,
    [isLoadingDaos, isLoadingServices, isSaving]
  );

  const onNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        name: event.target.value,
      });
    },
    [payloadData]
  );

  const onDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        description: event.target.value,
      });
    },
    [payloadData]
  );

  const onRateNumberChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        rateNumber: parseInt(event.target.value, 10),
      });
    },
    [payloadData]
  );

  const onRateUnitChange = useCallback(
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode
    ) => {
      setPayloadData({
        ...payloadData,
        rateUnit: event.target.value as RateUnit,
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

  const onDaoChange = useMemo(
    () =>
      daosList?.map((dao) => () =>
        setPayloadData((currentPayloadData) => {
          let daoIds: string[] = [...currentPayloadData.daoIds];
          if (daoIds.find((d) => d === dao.id)) {
            daoIds.splice(
              daoIds.findIndex((d) => d === dao.id),
              1
            );
          } else {
            daoIds.push(dao.id);
          }
          return {
            ...currentPayloadData,
            daoIds,
          };
        })
      ),
    [daosList]
  );

  const onSave = useCallback(() => {
    dispatch(postSchedulesApi.request(payloadData));
  }, [dispatch, payloadData]);

  useEffect(() => {
    dispatch(getSchedulesApi.request({}));
    dispatch(getDaosApi.request({}));
    dispatch(getServicesApi.request({}));
  }, [dispatch]);

  return {
    classes,
    derivedClasses,
    daosList,
    servicesList,
    payloadData,
    isLoading,
    onNameChange,
    onServiceChange,
    onRateNumberChange,
    onRateUnitChange,
    onDescriptionChange,
    onDaoChange,
    onSave,
  };
};

export default useScheduleCreate;
