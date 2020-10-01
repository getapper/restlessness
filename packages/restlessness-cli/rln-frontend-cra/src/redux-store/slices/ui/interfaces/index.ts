import { Action } from "redux";

export interface UiState {
  paletteType: "light" | "dark" | undefined;
}

export interface SetPaletteTypeAction extends Action {
  payload: {
    type: "light" | "dark" | undefined;
  };
}
