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
        <Button
          color="primary"
          variant="contained"
          href="#/services"
          style={{ marginLeft: "1rem" }}
        >
          Services
        </Button>
        <Button
          color="primary"
          variant="contained"
          href="#/models"
          style={{ marginLeft: "1rem" }}
        >
          Models
        </Button>
      </Paper>
    </div>
  );
};

export default memo(Dashboard);
