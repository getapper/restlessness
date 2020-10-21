import { takeEvery } from "redux-saga/effects";
import { postServicesApi } from "redux-store/extra-actions/apis";

export function* servicePostSaga() {
  yield takeEvery(postServicesApi.success.type, function () {
    window.location.href = "#/services";
  });
}
