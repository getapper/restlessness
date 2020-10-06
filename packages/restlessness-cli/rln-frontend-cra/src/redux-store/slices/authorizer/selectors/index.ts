import { RootState } from "redux-store";

export const getAuthorizersList = (state: RootState) => state?.authorizer.list;
