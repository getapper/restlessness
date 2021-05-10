import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry, Misc, PathResolver } from '@restlessness/core';
import { useQrCode } from "./qr-code";

class QRCodePackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-qr-code',
      name: 'QRCode',
      package: '@restlessness/plugin-qr-code',
    });
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(this.addEnv));
    await Misc.copyFolderRecursive('../assets/lib',PathResolver.getPrjPath, true);
  }

  async postEnvCreated(envName: string): Promise<void> {}

  async beforeEndpoint<T>(): Promise<void> {}

  async beforeSchedule<T>() {}

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {}
}

export default new QRCodePackage();

export { useQrCode };
