import path from 'path';
import envVars from 'root/services/env-vars';

const getPrjRoot = (): string => {
  if (envVars.isDev) {
    return path.join(process.cwd(), 'dummy-prj');
  }
  return envVars.prjPath;
};

export {
  getPrjRoot,
};
