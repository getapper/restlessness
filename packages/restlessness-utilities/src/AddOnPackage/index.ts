import path from 'path';
import PathResolver from '../PathResolver';

export default abstract class AddOnPackage {
  static load<T>(packageName: string): T {
    const pkg: T = require(path.join(PathResolver.getNodeModulesPath, packageName));
    return pkg;
  }

  abstract async postInstall(): Promise<void>

  abstract async postEnvCreated(envName: string): Promise<void>

  abstract async beforeLambda<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void>
}
