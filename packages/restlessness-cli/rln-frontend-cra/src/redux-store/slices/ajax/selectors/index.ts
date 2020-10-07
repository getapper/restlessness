import { RootState } from "redux-store";
import { ApiID } from "../../../extra-actions/apis";

export const getAjaxIsLoadingByApi = (api: ApiID) => (state: RootState) =>
  state?.ajax?.isLoading[api];
