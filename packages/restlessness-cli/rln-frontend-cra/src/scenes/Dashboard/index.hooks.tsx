import { useMemo } from "react";
import useStyles from "./index.styles";

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

  return {
    classes,
    derivedClasses,
  };
};

export default useDashboard;
