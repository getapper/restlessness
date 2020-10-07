import { takeEvery } from "redux-saga/effects";
import { postEndpointsApi } from "redux-store/extra-actions/apis";

export function* endpointPostSaga() {
  yield takeEvery(postEndpointsApi.success.type, function () {
    window.location.href = "#/endpoints";
  });
}
