import React from 'react';
import { Edit, SimpleForm, TextInput, SelectInput, ReferenceInput, BooleanInput } from 'react-admin';

const EndpointsUpdate = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="route" />
      <SelectInput source="method" choices={[
        { id: 'get', name: 'GET' },
        { id: 'post', name: 'POST' },
        { id: 'delete', name: 'DELETE' },
        { id: 'put', name: 'PUT' },
        { id: 'patch', name: 'PATCH' },
      ]} />
      <ReferenceInput label="Authorizer" source="authorizerId" reference="authorizers">
        <SelectInput />
      </ReferenceInput>
      <BooleanInput source="warmupEnabled" />
    </SimpleForm>
  </Edit>
);

export default EndpointsUpdate;
