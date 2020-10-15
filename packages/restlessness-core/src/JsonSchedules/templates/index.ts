import { JsonSchedulesEntry } from '../';

//@TODO use 'name' as folder name?
export const exporterTemplate = (jsonScheduleEventsEntries: JsonSchedulesEntry[]) => `import 'module-alias/register';
${jsonScheduleEventsEntries.map((jsonScheduleEventsEntry) => `import ${jsonScheduleEventsEntry.safeFunctionName} from 'root/schedules/${jsonScheduleEventsEntry.name}';`).join('\n')}

export {
  ${jsonScheduleEventsEntries.map(jsonScheduleEventsEntry => `${jsonScheduleEventsEntry.safeFunctionName},`).join('\n  ')}
};

`;

export const indexTemplate = () => 'export default () => {};\n';
