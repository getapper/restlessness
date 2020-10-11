import { takeEvery, put } from "redux-saga/effects";
import {
  getInfosApi,
  putEndpointByEndpointIdsApi,
  putInfosApi,
} from "redux-store/extra-actions/apis";
import { actions } from "../../";

export function* startupSaga() {
  yield takeEvery(actions.startup.type, function* () {
    yield put(getInfosApi.request({}));
  });
}

export function* infosPutSaga() {
  yield takeEvery(putInfosApi.success.type, function () {
    window.location.href = "#";
  });
}
