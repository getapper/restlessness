import { addPlugin, addToEachEnv } from '@restlessness/utilities';

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  try {
    await addPlugin(PROJECT_PATH, 's3', {
      id: 's3',
      name: 'AWS S3',
      package: '@restlessness/s3',
    });
  } catch (e) {
    console.error('Unhandled error while adding s3 to the plugins.json file!');
  }
  try {
    await addToEachEnv(PROJECT_PATH, 's3', {
      credentials: {
        accessKeyId: '',
        secretAccessKey: '',
      },
      region: '',
    });
  } catch (e) {
    console.error('Unhandler error while adding mongo config to the environments (envs/*.json) files!');
  }
};

postInstall()
  .then(() => console.log('Mongo DAO post install success'))
  .catch(err => {
    throw err;
  });
