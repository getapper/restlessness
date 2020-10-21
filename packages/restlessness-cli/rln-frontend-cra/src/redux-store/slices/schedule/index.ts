import { createSlice } from "@reduxjs/toolkit";
import { ScheduleState } from "./interfaces";
import * as selectors from "./selectors";
import * as sagas from "./sagas";
import * as extraActions from "../../extra-actions";
import {
  ApiSuccessAction,
  GetSchedulesResponseData,
} from "../../extra-actions";

const initialState: ScheduleState = {
  list: [],
};

export const scheduleStore = createSlice({
  name: "schedule",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getSchedulesApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetSchedulesResponseData>
    ) => {
      state.list = payload.data.schedules;
    },
  },
});

export { selectors, sagas };
