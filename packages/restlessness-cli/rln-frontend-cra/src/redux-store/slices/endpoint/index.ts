import { createSlice } from "@reduxjs/toolkit";
import { EndpointState } from "./interfaces";
import * as selectors from "./selectors";
import * as sagas from "./sagas";
import * as extraActions from "../../extra-actions";
import {
  ApiSuccessAction,
  GetEndpointsResponseData,
} from "../../extra-actions";

const initialState: EndpointState = {
  list: [],
};

export const endpointStore = createSlice({
  name: "endpoint",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getEndpointsApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetEndpointsResponseData>
    ) => {
      state.list = payload.data.endpoints;
    },
  },
});

export { selectors, sagas };
