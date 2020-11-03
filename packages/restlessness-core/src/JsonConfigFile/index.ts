import { promises as fs } from 'fs';

export interface JsonConfigEntry {
  id: string
}

export default abstract class JsonConfigFile<T extends JsonConfigEntry> {
  entries: T[]

  abstract get jsonPath(): string;

  async read(): Promise<void> {
    const file = await fs.readFile(this.jsonPath);
    this.entries = JSON.parse(file.toString());
  }

  async write() {
    await fs.writeFile(this.jsonPath, JSON.stringify(this.entries, null, 2));
  }

  async getEntryById(id: string): Promise<T> {
    if (!id) {
      return null;
    }
    await this.read();
    return this.entries.find(entry => entry['id'] === id);
  }

  async getEntryBySafeFunctionName(safeFunctionName: string): Promise<T> {
    if (!safeFunctionName) {
      return null;
    }
    await this.read();
    return this.entries.find(entry => entry['safeFunctionName'] === safeFunctionName);
  }

  /**
   * Add a new entry and save the Json file
   * @param entry
   */
  async addEntry(entry: T): Promise<void> {
    if (await this.getEntryById(entry.id)) {
      throw new Error(`Entry with id ${entry.id} already exists`);
    }
    await this.read();
    this.entries.push(entry);
    await this.write();
  }

  async removeEntryById(id: string): Promise<void> {
    await this.read();
    this.entries = this.entries.filter(entry => entry['id'] !== id);
    await this.write();
  }

  async updateEntry(entry: T) {
    await this.read();
    const idx = this.entries.findIndex(e => e.id === entry.id);
    if (idx === -1) {
      throw Error(`Entry with id ${entry.id} does not exist`);
    }
    this.entries[idx] = entry;
    await this.write();
  }
}
