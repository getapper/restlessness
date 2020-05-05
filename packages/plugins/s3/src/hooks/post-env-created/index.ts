import { addToEnv } from '@restlessness/utilities';

export default async (projectPath: string, envName: string) => {
  try {
    await addToEnv(projectPath, envName, 's3', {
      credentials: {
        accessKeyId: '',
        secretAccessKey: '',
      },
      region: '',
    });
  } catch (e) {
    console.error(`Unhandler error while adding s3 config to the environment envs/${envName}.json) file!`);
  }
};
