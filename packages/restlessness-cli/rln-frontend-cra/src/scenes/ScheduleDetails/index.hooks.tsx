import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  deleteScheduleByScheduleIdsApi,
  getDaosApi,
  getSchedulesApi,
  getServicesApi,
  postSchedulesApi,
  putScheduleByScheduleIdsApi,
  PutSchedulesByScheduleIdApiPayload,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getDaosList } from "../../redux-store/slices/dao/selectors";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";
import { getServicesList } from "../../redux-store/slices/service/selectors";
import { RateUnit } from "redux-store/slices/schedule/interfaces";
import { useParams } from "react-router-dom";
import { getSchedulesList } from "../../redux-store/slices/schedule/selectors";

interface RouteParams {
  scheduleId: string;
}

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
  const params = useParams<RouteParams>();
  const daosList = useSelector(getDaosList);
  const servicesList = useSelector(getServicesList);
  const schedulesList = useSelector(getSchedulesList);
  const [payloadData, setPayloadData] = useState<
    PutSchedulesByScheduleIdApiPayload
  >({
    description: null,
    rateNumber: 5,
    rateUnit: RateUnit.MINUTES,
    daoIds: [],
    serviceName: null,
    enabled: true,
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

  const scheduleData = useMemo(
    () => schedulesList?.find((schedule) => schedule.id === params.scheduleId),
    [schedulesList, params]
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

  const onEnabledChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setPayloadData({
        ...payloadData,
        enabled: checked,
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
    if (scheduleData?.id) {
      dispatch(
        putScheduleByScheduleIdsApi.request({
          scheduleId: scheduleData.id,
          scheduleData: payloadData,
        })
      );
    }
  }, [dispatch, payloadData, scheduleData]);

  const onDelete = useCallback(() => {
    if (scheduleData?.id) {
      dispatch(
        deleteScheduleByScheduleIdsApi.request({
          scheduleId: scheduleData.id,
        })
      );
    }
  }, [dispatch, scheduleData]);

  useEffect(() => {
    dispatch(getSchedulesApi.request({}));
    dispatch(getDaosApi.request({}));
    dispatch(getServicesApi.request({}));
  }, [dispatch]);

  useEffect(() => {
    if (scheduleData) {
      setPayloadData({
        description: scheduleData.description,
        rateNumber: scheduleData.rateNumber,
        rateUnit: scheduleData.rateUnit,
        enabled: scheduleData.enabled,
        daoIds: scheduleData?.daos?.map((d) => d.id) ?? [],
        serviceName: scheduleData.serviceName,
      });
    }
  }, [scheduleData]);

  return {
    classes,
    derivedClasses,
    daosList,
    servicesList,
    payloadData,
    isLoading,
    onServiceChange,
    onRateNumberChange,
    onRateUnitChange,
    onEnabledChange,
    onDescriptionChange,
    onDaoChange,
    onSave,
    onDelete,
    scheduleData,
  };
};

export default useScheduleCreate;
