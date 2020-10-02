import { createSlice } from "@reduxjs/toolkit";
import { AuthorizerState } from "./interfaces";
import * as selectors from "./selectors";
import * as extraActions from "../../extra-actions";
import {
  ApiSuccessAction,
  GetAuthorizersResponseData,
} from "../../extra-actions";

const initialState: AuthorizerState = {
  list: [],
};

export const authorizerStore = createSlice({
  name: "authorizer",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getAuthorizersApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetAuthorizersResponseData>
    ) => {
      state.list = payload.data.authorizers;
    },
  },
});

export { selectors };
