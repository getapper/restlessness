import React, { memo } from "react";
import useDashboard from "./index.hooks";
import { Button, Paper, Typography } from "@material-ui/core";
import { regions } from "../../redux-store/slices/info/interfaces";

const Dashboard = () => {
  const { classes, derivedClasses, projectInfos } = useDashboard();

  return (
    <div className={classes.container}>
      <Typography variant="h1">{projectInfos?.projectName}</Typography>
      <Typography variant="h4" style={{ marginTop: "1rem" }}>
        Organization: {projectInfos?.organization ?? "NOT SET!"}
      </Typography>
      <Typography variant="h4" style={{ marginTop: "1rem" }}>
        App: {projectInfos?.app ?? "NOT SET!"}
      </Typography>
      <Typography variant="h4" style={{ marginTop: "1rem" }}>
        Region:{" "}
        {projectInfos?.region
          ? `${regions[projectInfos?.region]} - ${projectInfos?.region}`
          : "NOT SET!"}
      </Typography>
      <Paper elevation={5} classes={derivedClasses.buttonContainer}>
        <Button color="primary" variant="contained" href="#/endpoints">
          Endpoints
        </Button>
        <Button
          color="primary"
          variant="contained"
          href="#/infos"
          style={{ marginLeft: "1rem" }}
        >
          Infos
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
        <Button
          color="primary"
          variant="contained"
          href="#/swagger"
          style={{ marginLeft: "1rem" }}
        >
          Swagger
        </Button>
      </Paper>
    </div>
  );
};

export default memo(Dashboard);
