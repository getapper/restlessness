import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry } from '@restlessness/core';
import AWSLambda from 'aws-lambda';

class StripePackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-stripe',
      name: 'Stripe Payment Gateway',
      package: '@restlessness/plugin-stripe',
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
    await envFile.setParametricValue('STRIPE_KEY');
  }
}

export default new StripePackage();
