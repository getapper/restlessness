import { Action } from "redux";
import { Dao } from "../../dao/interfaces";
import { Authorizer } from "../../authorizer/interfaces";
import { HttpMethod } from "../../../extra-actions/apis";

export interface Endpoint {
  id: string;
  safeFunctionName: string;
  route: string;
  method: HttpMethod;
  authorizer: Authorizer;
  daos: Dao[];
  warmupEnabled: boolean;
  serviceName: string;
}

export interface EndpointState {
  list: Endpoint[];
}

export interface SetPaletteTypeAction extends Action {
  payload: {
    type: "light" | "dark" | undefined;
  };
}
