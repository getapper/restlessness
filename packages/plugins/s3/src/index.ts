import { PluginPackage, EnvFile } from '@restlessness/core';
import useS3 from './aws-s3';
import AWSLambda from 'aws-lambda';

class S3Package extends PluginPackage {
  async postInstall(): Promise<void> {
  }

  async postEnvCreated(envName: string): Promise<void> {
    const envFile = new EnvFile(envName);
    await envFile.setParametricValue('RLN_S3_AWS_ACCESS_KEY_ID');
    await envFile.setParametricValue('RLN_S3_AWS_SECRET_ACCESS_KEY');
    await envFile.setParametricValue('RLN_S3_AWS_REGION');
  }

  async beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {}
  async beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context) {}
}

export { useS3 };
