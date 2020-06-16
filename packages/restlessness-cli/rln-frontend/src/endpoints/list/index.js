import React from 'react';
import { List, Datagrid, TextField, EditButton } from 'react-admin';

const EndpointsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="route" />
      <TextField source="method" />
      <TextField source="authorizer" />
      <EditButton />
    </Datagrid>
  </List>
);

export default EndpointsList;
