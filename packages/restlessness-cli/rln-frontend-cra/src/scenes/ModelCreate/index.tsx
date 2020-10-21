import React, { memo } from "react";
import useModelCreate from "./index.hooks";
import {
  Button,
  Typography,
  Paper,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@material-ui/core";

const ModelCreate = () => {
  const {
    classes,
    derivedClasses,
    payloadData,
    daosList,
    isLoading,
    onDaoChange,
    onNameChange,
    onSave,
  } = useModelCreate();

  return (
    <div className={classes.container}>
      <Typography variant="h2">Create model</Typography>
      <Paper elevation={4} classes={derivedClasses.modelEdit}>
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          Name
        </Typography>
        <TextField
          label="Route"
          fullWidth
          value={payloadData.name}
          onChange={onNameChange}
        />
        <Typography variant="h4" style={{ marginTop: "1rem" }}>
          DAO
        </Typography>
        <FormControl fullWidth style={{ marginTop: "1rem" }}>
          <Select
            disabled={isLoading}
            value={payloadData.daoId}
            onChange={onDaoChange}
          >
            {daosList.map((dao) => (
              <MenuItem key={dao.id} value={dao.id}>
                {dao.name}
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

export default memo(ModelCreate);
