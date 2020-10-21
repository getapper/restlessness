import { takeEvery } from "redux-saga/effects";
import {
  deleteScheduleByScheduleIdsApi,
  postSchedulesApi,
  putScheduleByScheduleIdsApi,
} from "redux-store/extra-actions/apis";

export function* schedulePostSaga() {
  yield takeEvery(postSchedulesApi.success.type, function () {
    window.location.href = "#/schedules";
  });
}

export function* schedulePutSaga() {
  yield takeEvery(putScheduleByScheduleIdsApi.success.type, function () {
    window.location.href = "#/schedules";
  });
}

export function* scheduleDeleteSaga() {
  yield takeEvery(deleteScheduleByScheduleIdsApi.success.type, function () {
    window.location.href = "#/schedules";
  });
}
