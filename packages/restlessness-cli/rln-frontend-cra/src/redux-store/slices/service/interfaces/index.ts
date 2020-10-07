import { Action } from "redux";

export interface Service {
  id: string;
}

export interface ServiceState {
  list: Service[];
}
