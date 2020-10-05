import React, { memo } from "react";
import useServicesList from "./index.hooks";

const ServicesList = () => {
  const { classes } = useServicesList();

  return <div className={classes.container}>ciao</div>;
};

export default memo(ServicesList);
