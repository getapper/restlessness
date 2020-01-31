import React from 'react';
import './App.css';
import { Admin, Resource } from 'react-admin';
import restProvider from 'ra-data-simple-rest';
import EndpointsList from './endpoints/list'

function App() {
  return (
    <Admin dataProvider={restProvider('http://localhost:4123')}>
      <Resource name="endpoints" list={EndpointsList}/>
    </Admin>
  );
}

export default App;
