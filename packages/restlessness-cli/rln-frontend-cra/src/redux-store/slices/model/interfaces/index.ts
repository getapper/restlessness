import { Dao } from "../../dao/interfaces";

export interface Model {
  id: string;
  dao: Dao;
}

export interface ModelState {
  list: Model[];
}
