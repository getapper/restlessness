import { Action } from "redux";

export interface Dao {
  id: string;
  name: string;
  package: string;
}

export interface DaoState {
  list: Dao[];
}
