import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput } from 'react-admin';

const ModelsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <SelectInput source="dao" choices={[
        { id: 'mongo', name: 'Mongo' },
        { id: 'none', name: 'None' },
      ]} />
    </SimpleForm>
  </Create>
);

export default ModelsCreate;
