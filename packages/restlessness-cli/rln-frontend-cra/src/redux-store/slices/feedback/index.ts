import { createSlice } from "@reduxjs/toolkit";
import {
  FeedbackState,
  SetFeedbackAction,
} from "redux-store/slices/feedback/interfaces";
import * as selectors from "./selectors";
import * as sagas from "./sagas";

export enum AlertTypes {
  success,
  info,
  error,
}

export const feedbackStore = createSlice({
  name: "feedback",
  initialState: {
    open: false,
    type: AlertTypes.info,
    message: "",
  } as FeedbackState,
  reducers: {
    setFeedback: (state, { payload }: SetFeedbackAction) => {
      state.open = true;
      state.type = payload.type ?? 0;
      state.message = payload.message || state.message;
    },
    closeFeedback: (state) => {
      state.open = false;
    },
  },
});

export { selectors, sagas };
