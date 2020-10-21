import { RootState } from "redux-store";

export const getSchedulesList = (state: RootState) => state?.schedule.list;
