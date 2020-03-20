import path from 'path';
import { promises as fs } from 'fs';

const postInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  const daoPath = path.join(PROJECT_PATH, 'daos.json');
  const daos = require(daoPath);
  if (daos.findIndex(dao => dao.name === 'mongo') === -1) {
    daos.push({
      id: 'mongo',
      name: 'MongoDB',
      package: '@restlessness/dao-mongo',
    });
    await fs.writeFile(daoPath, JSON.stringify(daos, null, 2));
  }
};

postInstall()
  .then(() => console.log('Mongo DAO post install success'))
  .catch(err => {
    throw err;
  });
