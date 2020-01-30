import React from 'react';
import './App.css';
import { Admin, Resource } from 'react-admin';
import restProvider from 'ra-data-simple-rest';

function App() {
  return (
    <Admin dataProvider={restProvider('http://localhost:3000')}>
      <Resource name="posts"/>
    </Admin>
  );
}

export default App;
