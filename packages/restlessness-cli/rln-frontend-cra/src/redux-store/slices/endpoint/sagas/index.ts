import { takeEvery } from "redux-saga/effects";
import {
  deleteEndpointByEndpointIdsApi,
  postEndpointsApi,
  putEndpointByEndpointIdsApi,
} from "redux-store/extra-actions/apis";

export function* endpointPostSaga() {
  yield takeEvery(postEndpointsApi.success.type, function () {
    window.location.href = "#/endpoints";
  });
}

export function* endpointPutSaga() {
  yield takeEvery(putEndpointByEndpointIdsApi.success.type, function () {
    window.location.href = "#/endpoints";
  });
}

export function* endpointDeleteSaga() {
  yield takeEvery(deleteEndpointByEndpointIdsApi.success.type, function () {
    window.location.href = "#/endpoints";
  });
}
