import React, { memo } from "react";
import useScheduleCreate from "./index.hooks";
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
  Grid,
} from "@material-ui/core";
import { RateUnit } from "redux-store/slices/schedule/interfaces";

const RateUnits = [
  {
    id: RateUnit.MINUTES,
    name: RateUnit.MINUTES.toUpperCase() + "S",
  },
  {
    id: RateUnit.HOURS,
    name: RateUnit.HOURS.toUpperCase() + "S",
  },
  {
    id: RateUnit.DAYS,
    name: RateUnit.DAYS.toUpperCase() + "S",
  },
];

const ScheduleCreate = () => {
  const {
    classes,
    derivedClasses,
    payloadData,
    daosList,
    servicesList,
    isLoading,
    onServiceChange,
    onNameChange,
    onRateUnitChange,
    onRateNumberChange,
    onDescriptionChange,
    onDaoChange,
    onSave,
  } = useScheduleCreate();

  console.log(payloadData.daoIds);

  return (
    <div className={classes.container}>
      <Typography variant="h2">Create schedule</Typography>
      <Paper elevation={4} classes={derivedClasses.scheduleEdit}>
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
          Name
        </Typography>
        <TextField
          label="Name"
          fullWidth
          value={payloadData.name}
          onChange={onNameChange}
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Description
        </Typography>
        <TextField
          label="Description"
          fullWidth
          value={payloadData.description}
          onChange={onDescriptionChange}
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Rate
        </Typography>
        <Grid container spacing={3} style={{ marginTop: "1rem" }}>
          <Grid item sm={6}>
            <TextField
              label="Rate Number"
              fullWidth
              value={payloadData.rateNumber}
              onChange={onRateNumberChange}
            />
          </Grid>
          <Grid item sm={6}>
            <FormControl fullWidth style={{ marginTop: "1rem" }}>
              <Select
                disabled={isLoading}
                value={payloadData.rateUnit}
                onChange={onRateUnitChange}
              >
                {RateUnits.map((rateUnit) => (
                  <MenuItem key={rateUnit.id} value={rateUnit.id}>
                    {rateUnit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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

export default memo(ScheduleCreate);
