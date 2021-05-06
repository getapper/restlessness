import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry } from '@restlessness/core';
import useBraintree from './braintree';
import AWSLambda from 'aws-lambda';

class BraintreePackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-braintree',
      name: 'Braintree',
      package: '@restlessness/plugin-braintree',
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
    await envFile.setParametricValue('RLN_BRAINTREE_IS_SANDBOX');
    await envFile.setParametricValue('RLN_BRAINTREE_MERCHANT_ID');
    await envFile.setParametricValue('RLN_BRAINTREE_PUBLIC_KEY');
    await envFile.setParametricValue('RLN_BRAINTREE_PRIVATE_KEY');
  }
}

export default new BraintreePackage();

export { useBraintree };
