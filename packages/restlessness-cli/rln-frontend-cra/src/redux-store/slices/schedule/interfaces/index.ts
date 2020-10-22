import { Dao } from "../../dao/interfaces";

export enum RateUnit {
  MINUTES = "minute",
  HOURS = "hour",
  DAYS = "day",
}

export interface Schedule {
  id: string;
  description: string;
  safeFunctionName: string;
  rateNumber: number;
  rateUnit: RateUnit;
  daos: Dao[];
  enabled: boolean;
  serviceName: string;
}

export interface ScheduleState {
  list: Schedule[];
}
