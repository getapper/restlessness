import React from 'react'
import {
  CheckboxGroupInput, Create, ReferenceArrayInput, ReferenceInput, SelectInput, SimpleForm, TextInput, BooleanInput
} from 'react-admin'

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
      <ReferenceInput label="Authorizer" source="authorizerId" reference="authorizers">
        <SelectInput />
      </ReferenceInput>
      <ReferenceArrayInput label="Daos" source="daoIds" reference="daos">
        <CheckboxGroupInput />
      </ReferenceArrayInput>
      <BooleanInput source="warmupEnabled" defaultValue={true} />
    </SimpleForm>
  </Create>
);

export default EndpointsCreate;
