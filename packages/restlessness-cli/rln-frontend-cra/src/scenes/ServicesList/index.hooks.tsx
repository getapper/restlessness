import { useCallback, useEffect, useMemo } from "react";
import useStyles from "./index.styles";
import { getServicesApi } from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getServicesList } from "../../redux-store/slices/service/selectors";

const useServicesList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);
  const dispatch = useDispatch();
  const servicesList = useSelector(getServicesList);

  const columns = useMemo(
    () => [{ field: "id", headerName: "Name", width: 400 }],
    []
  );

  useEffect(() => {
    dispatch(getServicesApi.request({}));
  }, [dispatch]);

  const onServiceSelected = useCallback(({ data }) => {
    window.location.href = `#/services/${data.id}`;
  }, []);

  return {
    classes,
    derivedClasses,
    columns,
    servicesList,
    onServiceSelected,
  };
};

export default useServicesList;
