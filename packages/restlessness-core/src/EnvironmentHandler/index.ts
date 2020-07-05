import path from 'path';
import { PathResolver } from '../';
import { config } from 'dotenv';

class EnvironmentHandler {
  load(): void {
    if (process.env['RLN_ENVIRONMENT_LOADED'] !== 'true') {
      process.env['RLN_PROJECT_PATH'] = process.env['RLN_PROJECT_PATH'] || process.cwd();
      config({ path: path.join(PathResolver.getPrjPath, '.env') });
      process.env['RLN_ENVIRONMENT_LOADED'] = 'true';
    }
  }
}

export default new EnvironmentHandler();
