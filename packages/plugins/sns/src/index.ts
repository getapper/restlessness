import { PluginPackage, EnvFile, JsonEnvsEntry, JsonEnvs, JsonPlugins } from '@restlessness/core';
import useSns from './aws-sns';
import AWSLambda from 'aws-lambda';

class SnsPackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-sns',
      name: 'AWS SNS',
      package: '@restlessness/plugin-sns',
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
    await envFile.setParametricValue('RLN_SNS_AWS_ACCESS_KEY_ID');
    await envFile.setParametricValue('RLN_SNS_AWS_SECRET_ACCESS_KEY');
    await envFile.setParametricValue('RLN_SNS_AWS_REGION');
  }
}

export default new SnsPackage();

export { useSns };
