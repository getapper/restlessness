import React, { memo } from "react";
import { DataGrid } from "@material-ui/data-grid";
import useModelsList from "./index.hooks";
import { Button } from "@material-ui/core";

const ModelsList = () => {
  const { columns, classes, modelsList, onModelSelected } = useModelsList();

  return (
    <div className={classes.container}>
      <Button
        color="primary"
        variant="contained"
        href="#/models/create"
        style={{
          position: "absolute",
          top: 5,
          right: "3rem",
        }}
      >
        Create
      </Button>
      <DataGrid
        rows={modelsList}
        columns={columns}
        disableMultipleSelection
        autoPageSize
        onRowSelected={onModelSelected}
      />
    </div>
  );
};

export default memo(ModelsList);
