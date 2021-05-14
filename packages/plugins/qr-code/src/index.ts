import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry } from '@restlessness/core';
import { useQrCode } from './qr-code';

class QRCodePackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-qr-code',
      name: 'QRCode',
      package: '@restlessness/plugin-qr-code',
    });
  }

  async postEnvCreated(envName: string): Promise<void> {}

  async beforeEndpoint<T>(): Promise<void> {}

  async beforeSchedule<T>() {}

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {
    const envFile = new EnvFile(jsonEnvsEntry.id);
  }
}

export default new QRCodePackage();

export { useQrCode };
