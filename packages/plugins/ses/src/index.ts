import { PluginPackage, EnvFile, JsonEnvsEntry, JsonEnvs, JsonPlugins } from '@restlessness/core';
import useSes from './aws-ses';
import AWSLambda from 'aws-lambda';

class SesPackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-ses',
      name: 'AWS SES',
      package: '@restlessness/plugin-ses',
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
    await envFile.setParametricValue('RLN_SES_AWS_ACCESS_KEY_ID');
    await envFile.setParametricValue('RLN_SES_AWS_SECRET_ACCESS_KEY');
    await envFile.setParametricValue('RLN_SES_AWS_REGION');
  }
}

export default new SesPackage();

export { useSes };
