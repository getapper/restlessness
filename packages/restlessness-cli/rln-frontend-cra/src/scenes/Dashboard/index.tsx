import React, { memo } from "react";
import useDashboard from "./index.hooks";
import { Button, Paper } from "@material-ui/core";

const Dashboard = () => {
  const { classes, derivedClasses } = useDashboard();

  return (
    <div className={classes.container}>
      Project
      <Paper elevation={5} classes={derivedClasses.buttonContainer}>
        <Button color="primary" variant="contained" href="#/endpoints">
          Endpoints
        </Button>
      </Paper>
    </div>
  );
};

export default memo(Dashboard);
