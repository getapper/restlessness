import React from 'react';
import { Create, SimpleForm, TextInput, SelectInput, ReferenceInput } from 'react-admin';

const EndpointsCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="route" />
      <SelectInput source="method" choices={[
        { id: 'get', name: 'GET' },
        { id: 'post', name: 'POST' },
        { id: 'delete', name: 'DELETE' },
        { id: 'put', name: 'PUT' },
        { id: 'patch', name: 'PATCH' },
      ]} />
      <ReferenceInput label="Auth" source="authId" reference="auths">
        <SelectInput />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export default EndpointsCreate;
