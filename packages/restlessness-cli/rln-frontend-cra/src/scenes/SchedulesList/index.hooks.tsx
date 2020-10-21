import { useCallback, useEffect, useMemo } from "react";
import useStyles from "./index.styles";
import { getSchedulesApi } from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getSchedulesList } from "../../redux-store/slices/schedule/selectors";

const useSchedulesList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);
  const dispatch = useDispatch();
  const schedulesList = useSelector(getSchedulesList);

  const columns = useMemo(
    () => [
      { field: "serviceName", headerName: "Service", width: 200 },
      { field: "id", headerName: "Name", width: 250 },
      { field: "safeFunctionName", headerName: "AWS name", width: 250 },
      { field: "rateNumber", headerName: "Rate number", width: 150 },
      { field: "rateUnit", headerName: "Rate unit", width: 150 },
    ],
    []
  );

  useEffect(() => {
    dispatch(getSchedulesApi.request({}));
  }, [dispatch]);

  const onScheduleSelected = useCallback(({ data }) => {
    window.location.href = `#/schedules/${data.id}`;
  }, []);

  return {
    classes,
    derivedClasses,
    columns,
    schedulesList,
    onScheduleSelected,
  };
};

export default useSchedulesList;
