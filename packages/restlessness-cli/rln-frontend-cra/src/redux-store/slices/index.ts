import * as extraActions from "../extra-actions";
import * as ajax from "./ajax";
import * as ui from "./ui";
import * as feedback from "./feedback";
import * as endpoint from "./endpoint";
import * as dao from "./dao";
import * as authorizer from "./authorizer";
import * as service from "./service";
import * as info from "./info";
import * as model from "./model";
import * as schedule from "./schedule";

export const reducers = {
  ajax: ajax.ajaxStore.reducer,
  ui: ui.uiStore.reducer,
  feedback: feedback.feedbackStore.reducer,
  endpoint: endpoint.endpointStore.reducer,
  dao: dao.daoStore.reducer,
  authorizer: authorizer.authorizerStore.reducer,
  service: service.serviceStore.reducer,
  info: info.infoStore.reducer,
  model: model.modelStore.reducer,
  schedule: schedule.scheduleStore.reducer,
};

export const actions = {
  ...extraActions,
  ...ajax.ajaxStore.actions,
  ...ui.uiStore.actions,
  ...feedback.feedbackStore.actions,
  ...endpoint.endpointStore.actions,
  ...dao.daoStore.actions,
  ...authorizer.authorizerStore.actions,
  ...service.serviceStore.actions,
  ...info.infoStore.actions,
  ...model.modelStore.actions,
  ...schedule.scheduleStore.actions,
};

export const selectors = {
  ...ajax.selectors,
  ...ui.selectors,
  ...feedback.selectors,
  ...endpoint.selectors,
  ...dao.selectors,
  ...authorizer.selectors,
  ...service.selectors,
  ...info.selectors,
  ...model.selectors,
  ...schedule.selectors,
};

export const sagas = {
  ...ajax.sagas,
  ...feedback.sagas,
  ...service.sagas,
  ...info.sagas,
  ...endpoint.sagas,
  ...model.sagas,
  ...schedule.sagas,
};
