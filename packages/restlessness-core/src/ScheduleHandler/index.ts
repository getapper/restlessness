import AWSLambda from 'aws-lambda';
import {
  EnvironmentHandler,
  DaoPackage,
  JsonDaos,
  JsonDaosEntry,
  JsonSchedules,
} from '../';

export const ScheduleHandler = async <T>(
  handler: (input: AWSLambda.ScheduledEvent | T) => any,
  scheduleId: string,
  event: AWSLambda.ScheduledEvent | T,
  context: AWSLambda.Context,
) => {
  EnvironmentHandler.load();

  const jsonScheduleEntry = await JsonSchedules.getEntryById(scheduleId);
  if (jsonScheduleEntry) {
    if (jsonScheduleEntry.daoIds?.length) {
      for (const daoId of jsonScheduleEntry.daoIds) {
        const jsonDaoEntry: JsonDaosEntry = await JsonDaos.getEntryById(daoId);
        try {
          const daoPackage: DaoPackage = DaoPackage.load(jsonDaoEntry.package);
          await daoPackage.beforeSchedule(event, context);
        } catch (e) {
          console.error(`Error when calling beforeLambda hook on dao: ${jsonDaoEntry.name} (${jsonDaoEntry.id})`, e);
        }
      }
    }
  } else {
    console.error(`Cannot find Schedule identified by ${scheduleId}`);
  }

  return handler(event);
};
