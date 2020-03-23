import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput, ReferenceInput } from 'react-admin';

const ModelsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <ReferenceInput label="Dao" source="daoId" reference="daos">
        <SelectInput />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default ModelsCreate;
