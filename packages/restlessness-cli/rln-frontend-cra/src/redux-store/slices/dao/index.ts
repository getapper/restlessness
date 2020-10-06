import { createSlice } from "@reduxjs/toolkit";
import { DaoState } from "./interfaces";
import * as selectors from "./selectors";
import * as extraActions from "../../extra-actions";
import { ApiSuccessAction, GetDaosResponseData } from "../../extra-actions";

const initialState: DaoState = {
  list: [],
};

export const daoStore = createSlice({
  name: "dao",
  initialState,
  reducers: {},
  extraReducers: {
    [extraActions.getDaosApi.success.type]: (
      state,
      { payload }: ApiSuccessAction<GetDaosResponseData>
    ) => {
      state.list = payload.data.daos;
    },
  },
});

export { selectors };
