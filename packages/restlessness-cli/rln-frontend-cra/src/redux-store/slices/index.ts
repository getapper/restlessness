import * as extraActions from "../extra-actions";
import * as ajax from "./ajax";
import * as ui from "./ui";
import * as feedback from "./feedback";
import * as endpoint from "./endpoint";
import * as dao from "./dao";
import * as authorizer from "./authorizer";

export const reducers = {
  ajax: ajax.ajaxStore.reducer,
  ui: ui.uiStore.reducer,
  feedback: feedback.feedbackStore.reducer,
  endpoint: endpoint.endpointStore.reducer,
  dao: dao.daoStore.reducer,
  authorizer: authorizer.authorizerStore.reducer,
};

export const actions = {
  ...extraActions,
  ...ajax.ajaxStore.actions,
  ...ui.uiStore.actions,
  ...feedback.feedbackStore.actions,
  ...endpoint.endpointStore.actions,
  ...dao.daoStore.actions,
  ...authorizer.authorizerStore.actions,
};

export const selectors = {
  ...ajax.selectors,
  ...ui.selectors,
  ...feedback.selectors,
  ...endpoint.selectors,
  ...dao.selectors,
  ...authorizer.selectors,
};

export const sagas = {
  ...ajax.sagas,
  ...feedback.sagas,
};
