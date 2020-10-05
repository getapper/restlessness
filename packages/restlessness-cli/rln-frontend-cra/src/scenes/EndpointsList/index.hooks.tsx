import { useMemo } from "react";
import useStyles from "./index.styles";

const useEndpointsList = () => {
  const classes = useStyles();
  const derivedClasses = useMemo(() => ({}), []);

  return {
    classes,
    derivedClasses,
  };
};

export default useEndpointsList;
