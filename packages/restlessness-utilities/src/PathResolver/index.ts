import path from 'path';

export default class PathResolver {
  static get getPrjPath(): string {
    return process.env['RLN_PROJECT_PATH'];
  }

  static get getConfigsPath(): string {
    return path.join(PathResolver.getPrjPath, 'configs');
  }

  static get getAuthorizersConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'authorizers.json');
  }

  static get getModelsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'models.json');
  }

  static get getEndpointsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'endpoints.json');
  }

  static get getFunctionsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'functions.json');
  }

  static get getNodeModulesPath(): string {
    return path.join(PathResolver.getPrjPath, 'node_modules');
  }

  static get getDistPath(): string {
    return path.join(PathResolver.getPrjPath, 'dist');
  }

  static get getSrcPath(): string {
    return path.join(PathResolver.getPrjPath, 'src');
  }

  static get getEndpointsPath(): string {
    return path.join(PathResolver.getSrcPath, 'endpoints');
  }

  static get getDistEndpointsPath(): string {
    return path.join(PathResolver.getDistPath, 'endpoints');
  }

  static get getModelsPath(): string {
    return path.join(PathResolver.getSrcPath, 'models');
  }

  static get getAuthorizersPath(): string {
    return path.join(PathResolver.getSrcPath, 'authorizers');
  }
}
