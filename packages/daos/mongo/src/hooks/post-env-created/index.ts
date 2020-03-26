import { addToEnv } from '@restlessness/utilities';

export default async (projectPath: string, envName: string) => {
  try {
    await addToEnv(projectPath, envName, 'mongo', {
      uri: '',
    });
  } catch (e) {
    console.error(`Unhandler error while adding mongo config to the environment envs/${envName}.json) file!`);
  }
};
