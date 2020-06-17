import path from 'path';
import { PathResolver } from '@restlessness/utilities';
import { config } from 'dotenv';

class EnvironmentHandler {
  loaded: boolean = false

  load(): void {
    if (!this.loaded) {
      process.env['RLN_PROJECT_PATH'] = process.env['RLN_PROJECT_PATH'] || process.cwd();
      config({ path: path.join(PathResolver.getPrjPath, '.env') });
      this.loaded = true;
    }
  }
}

export default new EnvironmentHandler();
