import { JsonSchedulesEntry } from '../';

export const exporterTemplate = (jsonScheduleEventsEntries: JsonSchedulesEntry[]) => `import 'module-alias/register';
${jsonScheduleEventsEntries.map((jsonScheduleEventsEntry) => `import ${jsonScheduleEventsEntry.safeFunctionName} from 'root/schedules/${jsonScheduleEventsEntry.name}';`).join('\n')}

export {
  ${jsonScheduleEventsEntries.map(jsonScheduleEventsEntry => `${jsonScheduleEventsEntry.safeFunctionName},`).join('\n  ')}
};
`;

export const indexTemplate = (scheduleId: string) => `import { ScheduleHandler } from '@restlessness/core';
import handler from './handler';

export default ScheduleHandler.bind(this, handler, '${scheduleId}');
`;

export const handlerTemplate = () => `export default async (event) => {};
`;
