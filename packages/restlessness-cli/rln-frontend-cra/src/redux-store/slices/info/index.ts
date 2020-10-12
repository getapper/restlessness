import { createSlice } from "@reduxjs/toolkit";
import { InfoState } from "./interfaces";
import * as selectors from "./selectors";
import * as extraActions from "../../extra-actions";
import {
  ApiSuccessAction,
  GetInfosResponseData,
  PutInfosApiResponseData,
} from "../../extra-actions";
import * as sagas from "./sagas";

const initialState: InfoState = {
  projectName: "",
};

export const infoStore = createSlice({
  name: "info",
  initialState,
  reducers: {
    startup: (state) => state,
  },
  extraReducers: {
    [extraActions.getInfosApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetInfosResponseData>
    ) => {
      state.projectName = payload.data.projectName;
      state.org = payload.data.org;
      state.app = payload.data.app;
      state.region = payload.data.region;
    },
    [extraActions.putInfosApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<PutInfosApiResponseData>
    ) => {
      state.org = payload.data.org;
      state.app = payload.data.app;
      state.region = payload.data.region;
    },
  },
});

export { selectors, sagas };
