import { Action } from "redux";

export interface Endpoint {
  id: string;
}

export interface EndpointState {
  list: Endpoint[];
}

export interface SetPaletteTypeAction extends Action {
  payload: {
    type: "light" | "dark" | undefined;
  };
}
