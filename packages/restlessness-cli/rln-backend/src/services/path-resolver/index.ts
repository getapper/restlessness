import path from 'path';
import envVars from 'root/services/env-vars';

const getPrjRoot = (): string => {
  if (envVars.isDev) {
    return '/Users/antoniogiordano/Documents/getapper/internal-projects/adhesion/Backend';
  }
  return envVars.prjPath;
};

const getSrcRoot = (): string => path.join(getPrjRoot(), 'src');

const getEndpointsRoot = (): string => path.join(getSrcRoot(), 'endpoints');

export {
  getSrcRoot,
  getPrjRoot,
  getEndpointsRoot,
};
