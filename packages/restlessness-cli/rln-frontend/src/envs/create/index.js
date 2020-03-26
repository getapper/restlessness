import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput } from 'react-admin';

const EnvsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name"/>
      <SelectInput source="type" choices={[
        {id: 'dev', name: 'Development'},
        {id: 'deploy', name: 'Deploy'},
      ]}/>
      <SelectInput source="stage" choices={[
        {id: null, name: 'None - Locale'},
        {id: 'dev', name: 'Preprod'},
        {id: 'deploy', name: 'Production'},
      ]}/>
    </SimpleForm>
  </Create>
);

export default EnvsCreate;
