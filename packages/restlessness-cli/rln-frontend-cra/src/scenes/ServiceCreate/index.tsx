import React, { memo } from "react";
import useServiceCreate from "./index.hooks";
import { Button, Typography, Paper, TextField } from "@material-ui/core";
import { HttpMethod } from "../../redux-store/extra-actions/apis";

const ServiceCreate = () => {
  const {
    classes,
    derivedClasses,
    payloadData,
    isLoading,
    onNameChange,
    onSave,
  } = useServiceCreate();

  return (
    <div className={classes.container}>
      <Typography variant="h2">Create service</Typography>
      <Paper elevation={4} classes={derivedClasses.serviceEdit}>
        <TextField
          label="Name"
          fullWidth
          value={payloadData.name}
          onChange={onNameChange}
        />
        <Button
          disabled={isLoading}
          variant="contained"
          color="primary"
          onClick={onSave}
          style={{ display: "block", marginTop: "2rem" }}
        >
          Save
        </Button>
      </Paper>
    </div>
  );
};

export default memo(ServiceCreate);
