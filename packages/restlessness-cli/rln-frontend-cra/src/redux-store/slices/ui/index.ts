import { createSlice } from "@reduxjs/toolkit";
import {
  UiState,
  SetPaletteTypeAction,
} from "redux-store/slices/ui/interfaces";
import * as selectors from "./selectors";

const initialState: UiState = {
  paletteType: "light",
};

export const uiStore = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPaletteType: (state, { payload }: SetPaletteTypeAction) => {
      state.paletteType = payload.type;
    },
  },
});

export { selectors };
