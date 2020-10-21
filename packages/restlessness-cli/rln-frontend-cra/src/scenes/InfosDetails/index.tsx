import React, { memo } from "react";
import useInfosDetails from "./index.hooks";
import {
  Button,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";

const InfosDetails = () => {
  const {
    classes,
    derivedClasses,
    payloadData,
    isLoading,
    regions,
    onRegionChange,
    onOrganizationChange,
    onAppChange,
    onSave,
  } = useInfosDetails();

  return (
    <div className={classes.container}>
      <Paper elevation={4} classes={derivedClasses.infosEdit}>
        <Typography variant="h4">Organization</Typography>
        <TextField
          fullWidth
          value={payloadData.org}
          onChange={onOrganizationChange}
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          App
        </Typography>
        <TextField fullWidth value={payloadData.app} onChange={onAppChange} />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Info
        </Typography>
        <FormControl fullWidth style={{ marginTop: "1rem" }}>
          <Select
            disabled={isLoading}
            value={payloadData.region ?? null}
            onChange={onRegionChange}
          >
            {Object.keys(regions).map((regionId) => (
              <MenuItem key={regionId} value={regionId}>
                {regions[regionId]} - {regionId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
      <Button
        disabled={isLoading}
        variant="contained"
        color="secondary"
        style={{ marginTop: "2rem" }}
      >
        Delete
      </Button>
    </div>
  );
};

export default memo(InfosDetails);
