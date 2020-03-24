import { addDao, addToEachEnv } from '@restlessness/utilities';

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  try {
    await addDao(PROJECT_PATH, 'mongo', {
      id: 'mongo',
      name: 'MongoDB',
      package: '@restlessness/dao-mongo',
    });
  } catch (e) {
    console.error('Unhandled error while adding mongo to the daos.json file!');
  }
  try {
    await addToEachEnv(PROJECT_PATH, 'mongo', {
      uri: '',
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
