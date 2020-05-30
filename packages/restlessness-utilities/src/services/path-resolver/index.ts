import path from 'path';

const getPrjPath = (): string => process.env['RLN_PROJECT_PATH'];

const getConfigsPath = (): string => path.join(getPrjPath(), 'configs');

const getModelsConfigPath = (): string => path.join(getConfigsPath(), 'models.json');

const getEndpointsConfigPath = (): string => path.join(getConfigsPath(), 'endpoints.json');

const getFunctionsConfigPath = (): string => path.join(getConfigsPath(), 'functions.json');

const getNodeModulesPath = (): string => path.join(getPrjPath(), 'node_modules');

const getDistPath = (): string => path.join(getPrjPath(), 'dist');

const getSrcPath = (): string => path.join(getPrjPath(), 'src');

const getEndpointsPath = (): string => path.join(getSrcPath(), 'endpoints');

const getDistEndpointsPath = (): string => path.join(getDistPath(), 'endpoints');

const getModelsPath = (): string => path.join(getSrcPath(), 'models');

const getAuthorizersPath = (): string => path.join(getSrcPath(), 'authorizers');

export {
  getNodeModulesPath,
  getSrcPath,
  getPrjPath,
  getEndpointsPath,
  getModelsPath,
  getDistEndpointsPath,
  getAuthorizersPath,
  getEndpointsConfigPath,
  getFunctionsConfigPath,
};
