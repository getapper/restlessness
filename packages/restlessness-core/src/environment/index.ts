import path from 'path';
import { config } from 'dotenv';

const getEnvironmentName = () :string => {
  const env = require(path.join(process.cwd(), 'env.json'));
  return env.name;
};

function getLoader() {
  let loaded = false;
  return () => {
    if (!loaded) {
      config({ path: path.join(process.cwd(), '.env') });
      loaded = true;
    }
  };
}

const loadEnv = getLoader();

export {
  getEnvironmentName,
  loadEnv,
};
