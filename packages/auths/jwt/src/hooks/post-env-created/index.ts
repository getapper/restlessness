import { addToEnv } from '@restlessness/utilities';

export default async (projectPath: string, envName: string) => {
  try {
    await addToEnv(projectPath, envName, 'jwt', {
      secret: '',
    });
  } catch (e) {
    console.error(`Unhandler error while adding jwt config to the environment envs/${envName}.json) file!`);
  }
};
