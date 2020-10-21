import React, { memo } from "react";
import { DataGrid } from "@material-ui/data-grid";
import useSchedulesList from "./index.hooks";
import { Button } from "@material-ui/core";

const SchedulesList = () => {
  const {
    columns,
    classes,
    schedulesList,
    onScheduleSelected,
  } = useSchedulesList();

  return (
    <div className={classes.container}>
      <Button
        color="primary"
        variant="contained"
        href="#/schedules/create"
        style={{
          position: "absolute",
          top: 5,
          right: "3rem",
        }}
      >
        Create
      </Button>
      <DataGrid
        rows={schedulesList}
        columns={columns}
        disableMultipleSelection
        autoPageSize
        onRowSelected={onScheduleSelected}
      />
    </div>
  );
};

export default memo(SchedulesList);
