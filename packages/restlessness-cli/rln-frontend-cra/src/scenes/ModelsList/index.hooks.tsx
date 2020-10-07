import { useCallback, useEffect, useMemo } from "react";
import useStyles from "./index.styles";
import { getModelsApi } from "../../redux-store/extra-actions/apis";
import { useDispatch, useSelector } from "react-redux";
import { getModelsList } from "../../redux-store/slices/model/selectors";

const useModelsList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);
  const dispatch = useDispatch();
  const modelsList = useSelector(getModelsList);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "Name", width: 400 },
      { field: "dao", headerName: "DAO", width: 150 },
    ],
    []
  );

  useEffect(() => {
    dispatch(getModelsApi.request({}));
  }, [dispatch]);

  const onModelSelected = useCallback(({ data }) => {
    window.location.href = `#/models/${data.id}`;
  }, []);

  return {
    classes,
    derivedClasses,
    columns,
    modelsList,
    onModelSelected,
  };
};

export default useModelsList;
