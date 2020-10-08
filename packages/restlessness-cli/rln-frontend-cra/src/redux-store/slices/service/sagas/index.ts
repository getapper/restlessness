import { takeEvery, fork, take, put, delay } from "redux-saga/effects";
import { Action } from "redux";
import axios, { AxiosResponse, CancelTokenSource, AxiosError } from "axios";
import {
  ApiRequestAction,
  postServicesApi,
} from "redux-store/extra-actions/apis";
import { apiBaseUrl } from "config";
import { actions } from "redux-store/slices";

export function* servicePostSaga() {
  yield takeEvery(postServicesApi.success.type, function () {
    window.location.href = "#/services";
  });
}
