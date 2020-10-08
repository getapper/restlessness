import React, { memo } from "react";
import { DataGrid } from "@material-ui/data-grid";
import useServicesList from "./index.hooks";
import { Button } from "@material-ui/core";

const ServicesList = () => {
  const {
    columns,
    classes,
    servicesList,
    onServiceSelected,
  } = useServicesList();

  return (
    <div className={classes.container}>
      <Button
        color="primary"
        variant="contained"
        href="#/services/create"
        style={{
          position: "absolute",
          top: 5,
          right: "3rem",
        }}
      >
        Create
      </Button>
      <DataGrid
        rows={servicesList}
        columns={columns}
        disableMultipleSelection
        autoPageSize
        onRowSelected={onServiceSelected}
      />
    </div>
  );
};

export default memo(ServicesList);
