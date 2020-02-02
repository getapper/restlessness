import React from 'react';
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput } from 'react-admin';

const EndpointsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="route" />
      <TextField source="method" />
      <EditButton basePath="/endpoints" />
    </Datagrid>
  </List>
);

export default EndpointsList;
