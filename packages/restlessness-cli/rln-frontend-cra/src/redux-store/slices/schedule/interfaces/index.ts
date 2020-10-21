import { Dao } from "../../dao/interfaces";

export enum RateUnit {
  MINUTES = "minute",
  HOURS = "hour",
  DAYS = "day",
}

export interface Schedule {
  id: string;
  safeFunctionName: string;
  rate: string;
  daos: Dao[];
  warmupEnabled: boolean;
  serviceName: string;
}

export interface ScheduleState {
  list: Schedule[];
}
