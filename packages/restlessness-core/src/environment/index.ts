import path from 'path';

const getEnvironmentName = () :string => {
  const env = require(path.join(process.cwd(), 'env.json'));
  return env.name;
};

export {
  getEnvironmentName,
};
