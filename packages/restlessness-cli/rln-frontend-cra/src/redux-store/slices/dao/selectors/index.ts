import { RootState } from "redux-store";

export const getDaosList = (state: RootState) => state?.dao.list;
