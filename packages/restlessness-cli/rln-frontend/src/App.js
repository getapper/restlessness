import React from 'react';
import './App.css';
import { Admin, Resource, ListGuesser } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import EnvsList from './envs/list'
import EndpointsList from './endpoints/list'
import ModelsList from './models/list'
import SwaggerList from './swagger/list'
import EnvsCreate from './envs/create'
import EndpointsCreate from './endpoints/create'
import ModelsCreate from './models/create'

function App() {
  return (
    <Admin dataProvider={restProvider('http://localhost:4123')}>
      <Resource name="envs" list={EnvsList} create={EnvsCreate}/>
      <Resource name="endpoints" list={EndpointsList} create={EndpointsCreate}/>
      <Resource name="models" list={ModelsList} create={ModelsCreate}/>
      <Resource name="daos" list={ListGuesser} />
      <Resource name="plugins" list={ListGuesser} />
      <Resource name="authorizers" />
      <Resource name="swagger" list={SwaggerList} />
    </Admin>
  );
}

export default App;
