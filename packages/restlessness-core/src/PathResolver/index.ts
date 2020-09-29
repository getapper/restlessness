import path from 'path';

export default class PathResolver {
  static get getPrjPath(): string {
    return process.env['RLN_PROJECT_PATH'];
  }

  static get getPackageJsonPath(): string {
    return path.join(PathResolver.getPrjPath, 'package.json');
  }

  static get getServerlessJsonPath(): string { //@TODO remove it
    return path.join(PathResolver.getPrjPath, 'serverless.json');
  }

  static get getServicesJsonPath(): string {
    return path.join(PathResolver.getPrjPath, 'serverless-services');
  }

  static get getSharedResourcesServerlessJsonPath(): string {
    return path.join(PathResolver.getPrjPath, 'serverless-services', 'shared-resources.json');
  }

  static get getOfflineServerlessJsonPath(): string {
    return path.join(PathResolver.getPrjPath, 'serverless-services', 'offline.json');
  }

  static get getEnvsPath(): string {
    return path.join(PathResolver.getPrjPath, 'envs');
  }

  static get getConfigsPath(): string {
    return path.join(PathResolver.getPrjPath, 'configs');
  }

  static get getAuthorizersConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'authorizers.json');
  }

  static get getEnvsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'envs.json');
  }

  static get getModelsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'models.json');
  }

  static get getEndpointsConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'endpoints.json');
  }

  static get getDaosConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'daos.json');
  }

  static get getDefaultHeadersConfigPath(): string {
    return path.join(PathResolver.getConfigsPath, 'default-headers.json');
  }

  static get getNodeModulesPath(): string {
    return path.join(PathResolver.getPrjPath, 'node_modules');
  }

  static get getDistPath(): string {
    return path.join(PathResolver.getPrjPath, 'dist');
  }

  static get getDeployPath(): string {
    return path.join(PathResolver.getPrjPath, 'deploy');
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
