import * as extraActions from "../extra-actions";
import * as ajax from "./ajax";
import * as ui from "./ui";
import * as feedback from "./feedback";
import * as extraSelectors from "../extra-selectors";

export const reducers = {
  ajax: ajax.ajaxStore.reducer,
  ui: ui.uiStore.reducer,
  feedback: feedback.feedbackStore.reducer,
};

export const actions = {
  ...extraActions,
  ...ajax.ajaxStore.actions,
  ...ui.uiStore.actions,
  ...feedback.feedbackStore.actions,
};

export const selectors = {
  ...ajax.selectors,
  ...ui.selectors,
  ...feedback.selectors,
  ...extraSelectors,
};

export const sagas = {
  ...ajax.sagas,
  ...feedback.sagas,
};
