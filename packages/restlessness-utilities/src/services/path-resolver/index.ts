import path from 'path';

const getPrjRoot = (): string => process.env['RLN_PROJECT_PATH'];

const getNodeModulesRoot = (): string => path.join(getPrjRoot(), 'node_modules');

const getDistRoot = (): string => path.join(getPrjRoot(), 'dist');

const getSrcRoot = (): string => path.join(getPrjRoot(), 'src');

const getEndpointsRoot = (): string => path.join(getSrcRoot(), 'endpoints');

const getDistEndpointsRoot = (): string => path.join(getDistRoot(), 'endpoints');

const getModelsRoot = (): string => path.join(getSrcRoot(), 'models');

const getAuthorizersRoot = (): string => path.join(getSrcRoot(), 'authorizers');

export {
  getNodeModulesRoot,
  getSrcRoot,
  getPrjRoot,
  getEndpointsRoot,
  getModelsRoot,
  getDistEndpointsRoot,
  getAuthorizersRoot,
};
