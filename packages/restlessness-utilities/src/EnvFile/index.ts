import { promises as fs } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import { parse } from 'dotenv';

export default class EnvFile {
  private static get envsPath(): string {
    return PathResolver.getEnvsPath;
  }

  private get currentEnvPath(): string {
    return path.join(EnvFile.envsPath, `.env.${this.envName}`);
  }

  private static get generatedEnvPath(): string {
    return path.join(PathResolver.getPrjPath, '.env');
  }

  constructor(private envName: string) {
  }

  private async readEnv(): Promise<{ [key: string]: string }> {
    const envFile = await fs.readFile(this.currentEnvPath);
    return parse(envFile.toString());
  }

  private static async write(filePath: string, env: { [key: string]: string }) {
    let output = '';
    for (let key in env) {
      output += `${key}='${env[key]}'\n`;
    }
    await fs.writeFile(filePath, output);
  }

  private async writeCurrentEnv(env: { [key: string]: string }) {
    await EnvFile.write(this.currentEnvPath, env);
  }

  async getValue(key: string): Promise<string> {
    const env = await this.readEnv();
    return env[key];
  }

  async setValue(key: string, value: string) {
    const env = await this.readEnv();
    env[key] = value;
    await this.writeCurrentEnv(env);
  }

  async generate(): Promise<void> {
    const env = await this.readEnv();
    await EnvFile.write(EnvFile.generatedEnvPath, env);
  }
}
