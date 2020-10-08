import { takeEvery } from "redux-saga/effects";
import { postModelsApi } from "redux-store/extra-actions/apis";

export function* modelPostSaga() {
  yield takeEvery(postModelsApi.success.type, function () {
    window.location.href = "#/models";
  });
}
