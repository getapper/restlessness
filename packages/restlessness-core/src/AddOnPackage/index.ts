import path from 'path';
import PathResolver from '../PathResolver';
import AWSLambda from 'aws-lambda';

export default abstract class AddOnPackage {
  static load<T>(packageName: string): T {
    return require(path.join(PathResolver.getNodeModulesPath, packageName)).default;
  }

  abstract async postInstall(): Promise<void>

  abstract async postEnvCreated(envName: string): Promise<void>

  abstract async beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void>

  abstract async beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context): Promise<void>
}
