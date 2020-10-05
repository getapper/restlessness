import React, { memo } from "react";
import useEndpointsList from "./index.hooks";

const EndpointsList = () => {
  const { classes } = useEndpointsList();

  return <div className={classes.container}>ciao</div>;
};

export default memo(EndpointsList);
