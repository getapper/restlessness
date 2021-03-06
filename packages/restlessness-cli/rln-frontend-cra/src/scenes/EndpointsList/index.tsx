import React, { memo } from "react";
import { DataGrid } from "@material-ui/data-grid";
import useEndpointsList from "./index.hooks";
import { Button } from "@material-ui/core";

const EndpointsList = () => {
  const {
    columns,
    classes,
    endpointsList,
    onEndpointSelected,
  } = useEndpointsList();

  return (
    <div className={classes.container}>
      <Button
        color="primary"
        variant="contained"
        href="#/endpoints/create"
        style={{
          position: "absolute",
          top: 5,
          right: "3rem",
        }}
      >
        Create
      </Button>
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
