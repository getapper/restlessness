import React from 'react';
import { Create, SimpleForm, TextInput } from 'react-admin';

const EndpointsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="route" />
      <TextInput source="method" />
    </SimpleForm>
  </Create>
);

export default EndpointsCreate;
