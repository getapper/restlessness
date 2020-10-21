import { BaseModel, Dao } from '../';
import { JsonSchedules, JsonSchedulesEntry, RateUnit } from '@restlessness/core';

export default class Schedule extends BaseModel {
  name: string
  description?: string
  rateNumber: number
  rateUnit: RateUnit
  enabled?: boolean
  serviceName: string
  input?: {
    type: 'input' | 'inputPath' | 'inputTransformer'
    value: { [key: string]: any }
  }
  safeFunctionName: string
  daos?: Dao[]

  static get model() {
    return JsonSchedules;
  }

  protected async fromConfigEntry(entry: JsonSchedulesEntry): Promise<void> {
    this.id = entry.id;
    this.description = entry.description;
    this.rateNumber = entry.rateNumber;
    this.rateUnit = entry.rateUnit;
    this.enabled = entry.enabled;
    this.serviceName = entry.serviceName;
    this.safeFunctionName = entry.safeFunctionName;
    const daos = entry.daoIds?.map(id => Dao.getById(id));
    this.daos = daos ? await Promise.all(daos) : [];
  }

  protected async toConfigEntry(): Promise<JsonSchedulesEntry> {
    return {
      id: this.id,
      description: this.description,
      rateNumber: this.rateNumber,
      rateUnit: this.rateUnit,
      enabled: this.enabled,
      serviceName: this.serviceName,
      safeFunctionName: this.safeFunctionName,
      daoIds: this.daos.map(dao => dao.id),
    };
  }

  async create(schedule: {
    name: string,
    description?: string,
    rateNumber: number,
    rateUnit: RateUnit,
    serviceName: string,
    daoIds?: string[],
  }) {
    const {
      name,
      description,
      rateNumber,
      rateUnit,
      serviceName,
      daoIds,
    } = schedule;
    const entry = await JsonSchedules.createSchedule({
      name,
      description,
      rateNumber,
      rateUnit,
      daoIds,
      serviceName,
    });
    await this.fromConfigEntry(entry);
  }
}
