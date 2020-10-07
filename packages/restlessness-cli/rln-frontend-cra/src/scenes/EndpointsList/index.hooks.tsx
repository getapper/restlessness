import { useCallback, useEffect, useMemo } from "react";
import useStyles from "./index.styles";
import { getEndpointsApi } from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getEndpointsList } from "../../redux-store/slices/endpoint/selectors";

const useEndpointsList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);
  const dispatch = useDispatch();
  const endpointsList = useSelector(getEndpointsList);

  const columns = useMemo(
    () => [
      { field: "route", headerName: "Route", width: 400 },
      { field: "method", headerName: "Method", width: 150 },
      { field: "safeFunctionName", headerName: "AWS name", width: 300 },
    ],
    []
  );

  useEffect(() => {
    dispatch(getEndpointsApi.request({}));
  }, [dispatch]);

  const onEndpointSelected = useCallback(({ data }) => {
    window.location.href = `#/endpoints/${data.id}`;
  }, []);

  return {
    classes,
    derivedClasses,
    columns,
    endpointsList,
    onEndpointSelected,
  };
};

export default useEndpointsList;
