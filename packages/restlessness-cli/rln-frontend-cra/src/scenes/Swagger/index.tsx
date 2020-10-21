import React, { memo } from "react";
import SwaggerUI from "swagger-ui-react";

const Swagger = () => {
  return <SwaggerUI url="http://localhost:4000/dev/openapi" />;
};

export default memo(Swagger);
