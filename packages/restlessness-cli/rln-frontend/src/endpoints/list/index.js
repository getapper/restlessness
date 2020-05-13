import React from 'react';
import { List, Datagrid, TextField } from 'react-admin';

const EndpointsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="route" />
      <TextField source="method" />
      <TextField source="authorizer" />
    </Datagrid>
  </List>
);

export default EndpointsList;
