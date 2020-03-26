import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

const EnvsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="name" />
      <TextField source="type" />
      <TextField source="stage" />
    </Datagrid>
  </List>
);

export default EnvsList;
