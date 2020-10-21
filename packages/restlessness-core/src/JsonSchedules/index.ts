import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import PathResolver from '../PathResolver';
import JsonServices from '../JsonServices';
import Misc from '../Misc';
import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { exporterTemplate, handlerTemplate, indexTemplate } from './templates';
import { promisify } from 'util';
import rimraf from 'rimraf';
import JsonDaos from '../JsonDaos';

export enum RateUnit {
  MINUTES = 'minute',
  HOURS = 'hour',
  DAYS = 'day',
}

export interface JsonSchedulesEntry extends JsonConfigEntry {
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
  daoIds?: string[]
}

class JsonSchedules extends JsonConfigFile<JsonSchedulesEntry> {
  get jsonPath(): string {
    return PathResolver.getSchedulesConfigPath;
  }

  async createSchedule(event: {
    name: string
    description?: string
    rateNumber: number
    rateUnit: RateUnit
    enabled?: boolean
    serviceName: string
    input?: {
      type: 'input' | 'inputPath' | 'inputTransformer'
      value: { [key: string]: any }
    },
    daoIds?: string[]
  }) {
    await this.read();

    await JsonServices.read();
    const { name, ...eventOthers } = event;
    const id = name;
    const fullServiceName = JsonServices.services[event.serviceName].service;
    const safeFunctionName = Misc.createAwsSafeFunctionName(id, fullServiceName);

    const entry: JsonSchedulesEntry = {
      ...eventOthers,
      enabled: event.enabled ?? true,
      id,
      safeFunctionName,
    };

    const { daoIds } = event;
    if (daoIds?.length) {
      for (const id of daoIds) {
        if (!await JsonDaos.getEntryById(id)) {
          throw new Error(`Dao with id ${id} not found`);
        }
      }
      entry.daoIds = [...daoIds];
    }

    await this.addEntry(entry);
    await this.write();

    // Generate Schedule events folder
    if (!fsSync.existsSync(PathResolver.getSchedulesPath)) {
      await fs.mkdir(PathResolver.getSchedulesPath);
    }

    const folderPath = path.join(PathResolver.getSchedulesPath, entry.id);
    await fs.mkdir(folderPath);
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate(entry.id));
    await fs.writeFile(path.join(folderPath, 'handler.ts'), handlerTemplate());

    await this.generateExporter();

    await JsonServices.addScheduleEvent(entry);
    await JsonServices.save();

    return entry;
  }

  async removeEntryById(id: string) {
    const jsonScheduleEventsEntry: JsonSchedulesEntry = await this.getEntryById(id);
    await super.removeEntryById(id);

    const folderPath = path.join(PathResolver.getSchedulesPath, jsonScheduleEventsEntry.id);
    await promisify(rimraf)(folderPath);

    await this.generateExporter();
  }

  private async generateExporter() {
    await fs.writeFile(
      path.join(PathResolver.getSrcPath, 'schedulesExporter.ts'),
      exporterTemplate(this.entries),
    );
  }
}

export default new JsonSchedules();
