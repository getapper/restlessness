import { useEffect, useMemo } from "react";
import useStyles from "./index.styles";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "../../redux-store";
import { getInfos } from "../../redux-store/slices/info/selectors";

const useDashboard = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(
    () => ({
      buttonContainer: {
        root: classes.buttonContainer,
      },
    }),
    [classes]
  );
  const dispatch = useDispatch();
  const projectInfos = useSelector(getInfos);

  useEffect(() => {
    dispatch(actions.startup());
  }, [dispatch]);

  return {
    classes,
    derivedClasses,
    projectInfos,
  };
};

export default useDashboard;
