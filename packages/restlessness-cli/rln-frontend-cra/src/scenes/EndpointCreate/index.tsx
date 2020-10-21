import React, { memo } from "react";
import useEndpointCreate from "./index.hooks";
import {
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { HttpMethod } from "../../redux-store/extra-actions/apis";

const HttpMethods = [
  {
    id: HttpMethod.GET,
    name: HttpMethod.GET.toUpperCase(),
  },
  {
    id: HttpMethod.POST,
    name: HttpMethod.POST.toUpperCase(),
  },
  {
    id: HttpMethod.DELETE,
    name: HttpMethod.DELETE.toUpperCase(),
  },
  {
    id: HttpMethod.PUT,
    name: HttpMethod.PUT.toUpperCase(),
  },
  {
    id: HttpMethod.PATCH,
    name: HttpMethod.PATCH.toUpperCase(),
  },
];

const EndpointCreate = () => {
  const {
    classes,
    derivedClasses,
    payloadData,
    daosList,
    authorizersList,
    servicesList,
    isLoading,
    onWarmUpChange,
    onRouteChange,
    onMethodChange,
    onServiceChange,
    onAuthorizerChange,
    onDaoChange,
    onSave,
  } = useEndpointCreate();

  return (
    <div className={classes.container}>
      <Typography variant="h2">Create endpoint</Typography>
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
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Route
        </Typography>
        <TextField
          label="Route"
          fullWidth
          value={payloadData.route}
          onChange={onRouteChange}
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Method
        </Typography>
        <FormControl fullWidth style={{ marginTop: "1rem" }}>
          <Select
            disabled={isLoading}
            value={payloadData.method}
            onChange={onMethodChange}
          >
            {HttpMethods.map((httpMethod) => (
              <MenuItem key={httpMethod.id} value={httpMethod.id}>
                {httpMethod.name}
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
        {daosList?.map((dao, index) => (
          <FormControlLabel
            key={dao.id}
            control={
              <Switch
                disabled={isLoading}
                checked={payloadData?.daoIds?.includes(dao.id) ?? false}
                onChange={onDaoChange[index]}
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
            value={payloadData.authorizerId}
            onChange={onAuthorizerChange}
            disabled={isLoading}
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
    </div>
  );
};

export default memo(EndpointCreate);
