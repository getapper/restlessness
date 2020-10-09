import React, { memo } from "react";
import useEndpointDetails from "./index.hooks";
import {
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  FormControl,
  Select,
  MenuItem,
} from "@material-ui/core";

const EndpointDetails = () => {
  const {
    classes,
    derivedClasses,
    endpointData,
    payloadData,
    daosList,
    servicesList,
    authorizersList,
    isLoading,
    onWarmUpChange,
    onServiceChange,
    onSave,
  } = useEndpointDetails();

  return (
    <div className={classes.container}>
      <Typography variant="h2">Endpoint: {endpointData?.id}</Typography>
      <Paper elevation={4} classes={derivedClasses.endpointEdit}>
        <Typography variant="h4">Service</Typography>
        <FormControl fullWidth style={{ marginTop: "1rem" }}>
          <Select
            disabled={isLoading}
            value={payloadData.serviceName}
            onChange={onServiceChange}
          >
            {servicesList.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          style={{ marginTop: "1rem" }}
          control={
            <Switch
              disabled={isLoading}
              checked={payloadData.warmupEnabled}
              onChange={onWarmUpChange}
            />
          }
          label="WarmUp Enabled"
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          DAOs
        </Typography>
        {daosList?.map((dao) => (
          <FormControlLabel
            key={dao.id}
            control={
              <Switch
                disabled={isLoading}
                checked={
                  payloadData?.daoIds?.includes(dao.id) !== null ?? false
                }
              />
            }
            label={dao.name}
          />
        ))}
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Authorizer
        </Typography>
        <FormControl fullWidth style={{ marginTop: "1rem" }}>
          <Select
            disabled={isLoading}
            value={authorizersList?.length ? payloadData?.authorizerId : null}
          >
            {authorizersList.map((authorizer) => (
              <MenuItem key={authorizer.id} value={authorizer.id}>
                {authorizer.name}
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

export default memo(EndpointDetails);
