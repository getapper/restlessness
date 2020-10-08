import { RootState } from "redux-store";

export const getServicesList = (state: RootState) => state?.service.list;
