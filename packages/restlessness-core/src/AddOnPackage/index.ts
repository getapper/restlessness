import path from 'path';
import PathResolver from '../PathResolver';
import AWSLambda from 'aws-lambda';

export default abstract class AddOnPackage {
  static load<T>(packageName: string): T {
    return require(path.join(PathResolver.getNodeModulesPath, packageName)).default;
  }

  abstract postInstall(): Promise<void>

  abstract postEnvCreated(envName: string): Promise<void>

  abstract beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void>

  abstract beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context): Promise<void>
}
