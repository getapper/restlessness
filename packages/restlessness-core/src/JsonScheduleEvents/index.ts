import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import PathResolver from '../PathResolver';
import JsonServices from '../JsonServices';
import Misc from '../Misc';
import fsSync, { promises as fs } from 'fs';
import path from 'path';
import { exporterTemplate, indexTemplate } from './templates';
import { promisify } from 'util';
import rimraf from 'rimraf';

export interface JsonScheduleEventsEntry extends JsonConfigEntry {
  name: string
  description?: string
  rate: string
  enabled?: boolean
  serviceName: string
  input?: {
    type: 'input' | 'inputPath' | 'inputTransformer'
    value: { [key: string]: any }
  }
  safeFunctionName: string
}

class JsonScheduleEvents extends JsonConfigFile<JsonScheduleEventsEntry> {
  get jsonPath(): string {
    return PathResolver.getScheduleEventsConfigPath;
  }

  async createScheduleEvent(event: {
    name: string
    description?: string
    rate: string
    enabled?: boolean
    serviceName: string
    input?: {
      type: 'input' | 'inputPath' | 'inputTransformer'
      value: { [key: string]: any }
    }
  }) {
    await this.read();

    await JsonServices.read();
    const id = event.name;
    const fullServiceName = JsonServices.services[event.serviceName].service;
    const safeFunctionName = Misc.createAwsSafeFunctionName(id, fullServiceName);

    const entry = {
      ...event,
      enabled: event.enabled ?? true,
      id,
      safeFunctionName,
    };
    await this.addEntry(entry);
    await this.write();

    // Generate Schedule events folder
    if (!fsSync.existsSync(PathResolver.getScheduleEventsPath)) {
      await fs.mkdir(PathResolver.getScheduleEventsPath);
    }

    //@TODO use 'name' as folder name?
    const folderPath = path.join(PathResolver.getScheduleEventsPath, entry.name);
    await fs.mkdir(folderPath);
    await fs.writeFile(path.join(folderPath, 'index.ts'), indexTemplate());

    await this.generateExporter();

    await JsonServices.addScheduleEvent(entry);
    await JsonServices.save();
  }

  async removeEntryById(id: string) {
    const jsonScheduleEventsEntry: JsonScheduleEventsEntry = await this.getEntryById(id);
    await super.removeEntryById(id);

    const folderPath = path.join(PathResolver.getScheduleEventsPath, jsonScheduleEventsEntry.name);
    await promisify(rimraf)(folderPath);
  }

  private async generateExporter() {
    await fs.writeFile(
      path.join(PathResolver.getSrcPath, 'schedulesExporter.ts'),
      exporterTemplate(this.entries),
    );
  }
}

export default new JsonScheduleEvents();
