import { createSlice } from "@reduxjs/toolkit";
import { ModelState } from "./interfaces";
import * as selectors from "./selectors";
import * as extraActions from "../../extra-actions";
import { ApiSuccessAction, GetModelsResponseData } from "../../extra-actions";
import * as sagas from "./sagas";

const initialState: ModelState = {
  list: [],
};

export const modelStore = createSlice({
  name: "model",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getModelsApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetModelsResponseData>
    ) => {
      state.list = payload.data.models;
    },
  },
});

export { selectors, sagas };
