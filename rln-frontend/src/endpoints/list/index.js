import React from 'react';
import { List, Datagrid, Edit, Create, SimpleForm, DateField, TextField, EditButton, TextInput, DateInput } from 'react-admin';

export const EndpointsList = (props) => (
  <List {...props}>
    <Datagrid>
      <TextField source="route" />
      <EditButton basePath="/endpoints" />
    </Datagrid>
  </List>
);

export default EndpointsList;
