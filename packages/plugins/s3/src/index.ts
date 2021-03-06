import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry } from '@restlessness/core';
import useS3 from './aws-s3';
import AWSLambda from 'aws-lambda';

class S3Package extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-s3',
      name: 'AWS S3',
      package: '@restlessness/plugin-s3',
    });
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(this.addEnv));
  }

  async postEnvCreated(envName: string): Promise<void> {
    await JsonEnvs.read();
    const jsonEnvsEntry = await JsonEnvs.getEntryById(envName);
    await this.addEnv(jsonEnvsEntry);
  }

  async beforeEndpoint<T>(event: AWSLambda.APIGatewayProxyEventBase<T>, context: AWSLambda.Context): Promise<void> {}

  async beforeSchedule<T>(event: AWSLambda.ScheduledEvent | T, context: AWSLambda.Context) {}

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {
    const envFile = new EnvFile(jsonEnvsEntry.id);
    await envFile.setParametricValue('RLN_S3_AWS_ACCESS_KEY_ID');
    await envFile.setParametricValue('RLN_S3_AWS_SECRET_ACCESS_KEY');
    await envFile.setParametricValue('RLN_S3_AWS_REGION');
  }
}

export default new S3Package();

export { useS3 };
