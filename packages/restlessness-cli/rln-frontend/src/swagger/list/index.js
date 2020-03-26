import React from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css"

console.log('omgg!!!', __dirname)
const SwaggerList = (props) => (
  <SwaggerUI url={`http://localhost:4123/openapi`} />
);

export default SwaggerList;
