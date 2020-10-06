import React, { memo } from "react";
import { DataGrid } from "@material-ui/data-grid";
import useEndpointsList from "./index.hooks";

const EndpointsList = () => {
  const {
    columns,
    classes,
    endpointsList,
    onEndpointSelected,
  } = useEndpointsList();

  return (
    <div className={classes.container}>
      <DataGrid
        rows={endpointsList}
        columns={columns}
        disableMultipleSelection
        autoPageSize
        onRowSelected={onEndpointSelected}
      />
    </div>
  );
};

export default memo(EndpointsList);
