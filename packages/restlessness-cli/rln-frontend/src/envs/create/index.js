import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput } from 'react-admin';

const EnvsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

export default EnvsCreate;
