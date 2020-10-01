import { useMemo } from "react";
import useStyles from "./index.styles";

const useServicesList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);

  return {
    classes,
    derivedClasses,
  };
};

export default useServicesList;
