import path from 'path';
import envVars from 'root/services/env-vars';

const getPrjRoot = (): string => {
  if (envVars.isDev) {
    return process.cwd();
  }
  return envVars.prjPath;
};

const getEndpointsRoot = (): string => path.join(getPrjRoot(), 'src', 'endpoints');

export {
  getPrjRoot,
  getEndpointsRoot,
};
