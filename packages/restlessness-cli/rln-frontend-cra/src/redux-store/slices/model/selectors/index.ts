import { RootState } from "redux-store";

export const getModelsList = (state: RootState) => state?.model.list;
