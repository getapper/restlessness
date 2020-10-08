import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "./index.styles";
import {
  postServicesApi,
  PostServicesApiParams,
} from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getAjaxIsLoadingByApi } from "../../redux-store/slices/ajax/selectors";

const useServiceCreate = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      serviceEdit: {
        root: classes.serviceEdit,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const [payloadData, setPayloadData] = useState<PostServicesApiParams>({
    name: null,
  });
  const isSaving = useSelector(getAjaxIsLoadingByApi(postServicesApi.api));

  const isLoading = useMemo(() => isSaving, [isSaving]);

  const onNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPayloadData({
        ...payloadData,
        name: event.target.value,
      });
    },
    [payloadData]
  );

  const onSave = useCallback(() => {
    dispatch(postServicesApi.request(payloadData));
  }, [dispatch, payloadData]);

  return {
    classes,
    derivedClasses,
    payloadData,
    isLoading,
    onNameChange,
    onSave,
  };
};

export default useServiceCreate;
