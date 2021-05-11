import { PluginPackage, EnvFile, JsonPlugins, JsonEnvs, JsonEnvsEntry, Misc, PathResolver } from '@restlessness/core';
import { useQrCode, QrCodeOptions, QrCorrectLevels } from "./qr-code";
import path from 'path';

class QRCodePackage extends PluginPackage {
  async postInstall(): Promise<void> {
    await JsonPlugins.addEntry({
      id: 'plugin-qr-code',
      name: 'QRCode',
      package: '@restlessness/plugin-qr-code',
    });
    await JsonEnvs.read();
    await Promise.all(JsonEnvs.entries.map(this.addEnv));
    await Misc.copyFolderRecursive(path.join(__dirname,'..','assets','lib'),path.join(PathResolver.getPrjPath,'lib'), true);
  }

  async postEnvCreated(envName: string): Promise<void> {}

  async beforeEndpoint<T>(): Promise<void> {}

  async beforeSchedule<T>() {}

  private async addEnv(jsonEnvsEntry: JsonEnvsEntry): Promise<void> {}
}

export default new QRCodePackage();

export { useQrCode, QrCodeOptions, QrCorrectLevels };
