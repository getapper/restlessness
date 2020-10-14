import JsonConfigFile, { JsonConfigEntry } from '../JsonConfigFile';
import PathResolver from '../PathResolver';
import JsonServices from '../JsonServices';
import Misc from '../Misc';

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

    await JsonServices.addScheduleEvent(entry);
    await JsonServices.save();
  }
}

export default new JsonScheduleEvents();
