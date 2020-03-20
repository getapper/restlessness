import path from 'path';
import envVars from 'root/services/env-vars';

const getPrjRoot = (): string => {
  if (envVars.isDev) {
    // return process.cwd();
    return '/Users/antoniogiordano/Documents/getapper/adhesion/adhesion/Backend';
  }
  return envVars.prjPath;
};

const getNodeModulesRoot = (): string => path.join(getPrjRoot(), 'node_modules');

const getSrcRoot = (): string => path.join(getPrjRoot(), 'src');

const getEndpointsRoot = (): string => path.join(getSrcRoot(), 'endpoints');

const getModelsRoot = (): string => path.join(getSrcRoot(), 'models');

export {
  getNodeModulesRoot,
  getSrcRoot,
  getPrjRoot,
  getEndpointsRoot,
  getModelsRoot,
};
