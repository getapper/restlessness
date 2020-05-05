import path from 'path';

const preInstall = async () => {
  const PROJECT_PATH = process.argv[2];
  const restlessnessConfigPath = path.join(PROJECT_PATH, '.restlessness.json');
  try {
    require(restlessnessConfigPath);
  } catch (e) {
    throw new Error(`Restlessness project not found in ${PROJECT_PATH}`);
  }
};

preInstall()
  .then()
  .catch(err => {
    console.error(err)
    process.exit(1);
  });
