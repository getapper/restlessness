import React, { Fragment } from 'react';
import {
  List, Datagrid, TextField, EditButton, BulkDeleteButton, Button,BooleanField,
  useDataProvider, useNotify, useUnselectAll, useRefresh
} from 'react-admin';

const PostBulkActionButtons = props => {
  const { resource, selectedIds } = props
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const unselectAll = useUnselectAll(resource);
  const refresh = useRefresh();

  const setWarmup = enabled => {
    const params = {
      ids: selectedIds,
      data: { warmupEnabled: enabled }
    };
    dataProvider
      .updateMany(resource, params)
      .then(() => {
        refresh();
        unselectAll();
        notify('Warmup ' + enabled ? 'enabled' : 'disabled');
      })
      .catch(() => {
        notify('Error ' + enabled ? 'enabling' : 'disabling' + ' warmup');
      })
  }

  return (
    <Fragment>
      <Button label="Enable Warmup" onClick={() => setWarmup(true)}/>
      <Button label="Disable Warmup" onClick={() => setWarmup(false)}/>
      <BulkDeleteButton {...props} />
    </Fragment>)
}

const EndpointsList = (props) => (
  <List {...props} bulkActionButtons={<PostBulkActionButtons/>}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="route" />
      <TextField source="method" />
      <TextField source="authorizer" />
      <BooleanField source="warmupEnabled" />
      <EditButton />
    </Datagrid>
  </List>
);

export default EndpointsList;
