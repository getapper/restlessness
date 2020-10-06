import { RootState } from "redux-store";

export const getEndpointsList = (state: RootState) => state?.endpoint.list;
