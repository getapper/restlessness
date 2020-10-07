import { createSlice } from "@reduxjs/toolkit";
import { ServiceState } from "./interfaces";
import * as selectors from "./selectors";
import * as extraActions from "../../extra-actions";
import { ApiSuccessAction, GetServicesResponseData } from "../../extra-actions";
import * as sagas from "./sagas";

const initialState: ServiceState = {
  list: [],
};

export const serviceStore = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getServicesApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetServicesResponseData>
    ) => {
      state.list = payload.data.services;
    },
  },
});

export { selectors, sagas };
