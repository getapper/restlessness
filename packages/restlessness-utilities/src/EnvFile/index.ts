import { promises as fs, existsSync } from 'fs';
import path from 'path';
import PathResolver from '../PathResolver';
import { parse, config } from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export type ENV = { [key: string]: string };

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
    if (!existsSync(this.currentEnvPath)) {
      throw new Error(`Environment ${envName} does not exist`);
    }
  }

  private async readEnv(): Promise<ENV> {
    const envFile = await fs.readFile(this.currentEnvPath);
    return parse(envFile.toString());
  }

  private static async write(filePath: string, env: ENV) {
    let output = '';
    for (let key in env) {
      output += `${key}=${env[key]}\n`;
    }
    await fs.writeFile(filePath, output);
  }

  private async writeCurrentEnv(env: ENV): Promise<void> {
    await EnvFile.write(this.currentEnvPath, env);
  }

  async getValue(key: string): Promise<string> {
    const env = await this.readEnv();
    return env[key];
  }

  /**
   * Given a key and a value creates a new line entry as:
   * key=value
   *
   * @param key
   * @param value
   */
  async setValue(key: string, value: string, overwrite: boolean = false): Promise<void> {
    const env = await this.readEnv();
    if (!overwrite && typeof env[key] !== 'undefined') {
      throw new Error('Key already exists');
    }
    env[key] = value;
    await this.writeCurrentEnv(env);
  }

  /**
   * Given a key name creates a new line entry as:
   * key={key_ENVNAME}
   *
   * @param key
   */
  async setParametricValue(key: string): Promise<void> {
    await this.setValue(key, `\${${key}_${this.envName.toUpperCase()}}`);
  }

  async expand(): Promise<ENV> {
    const env = await this.readEnv();
    return dotenvExpand({ parsed: env }).parsed;
  }

  async generate(): Promise<void> {
    const env = await this.expand();
    await EnvFile.write(EnvFile.generatedEnvPath, env);
  }
}
