import { takeEvery, fork, take, put, delay } from "redux-saga/effects";
import { Action } from "redux";
import axios, { AxiosResponse, CancelTokenSource, AxiosError } from "axios";
import { ApiRequestAction } from "redux-store/extra-actions/apis";
import { apiBaseUrl } from "config";
import { actions } from "redux-store/slices";

function* ajaxTask(
  requestAction: ApiRequestAction,
  cancelToken: CancelTokenSource
): any {
  const { type, payload } = requestAction;
  const { params, options } = payload;
  const { path, method, body, query } = params;
  const api = type.replace("/request", "");
  let response: AxiosResponse | null = null;

  yield put(
    actions.setApiLoading({
      api,
      isLoading: true,
    })
  );

  try {
    if (options?.requestDelay) {
      yield delay(options.requestDelay);
    }
    response = yield axios({
      url: `${apiBaseUrl()}${path}`,
      method,
      data: body,
      params: query,
      cancelToken: cancelToken.token,
    });

    yield put({
      type: `${api}/success`,
      payload: {
        status: response?.status,
        data: response?.data,
      },
    });
  } catch (e) {
    const axiosError = e as AxiosError;
    if (!axios.isCancel(axiosError)) {
      const status = axiosError?.response?.status || 500;
      const message: string =
        axiosError?.response?.data?.message || axiosError.message;
      yield put({
        type: `${api}/fail`,
        payload: {
          status,
          message,
        },
      });
    }
  } finally {
    yield put(
      actions.setApiLoading({
        api,
        isLoading: false,
      })
    );
  }
}

export function* requestSaga() {
  yield takeEvery(
    (action: Action) => /^apis\/(.*?)\/request$/.test(action.type),
    function* (requestAction: ApiRequestAction) {
      try {
        const { type } = requestAction;
        const api = type.replace("/request", "");
        const cancelToken = axios.CancelToken.source();
        const task: any = yield fork(ajaxTask, requestAction, cancelToken);
        let exit = false;

        while (!exit) {
          const resultAction: Action = yield take([
            `${api}/success`,
            `${api}/fail`,
            `${api}/cancel`,
          ]);

          if (
            resultAction.type === `${api}/cancel` &&
            task &&
            task.isRunning()
          ) {
            cancelToken.cancel("Canceled");
          }

          exit = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
  );
}
