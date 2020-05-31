import fsSync, { promises as fs } from 'fs';
import path from 'path';
import PathResolver from 'root/PathResolver';
import Dao from 'root/Dao';
import { indexTemplate } from 'root/Model/templates';
import Misc from 'root/Misc';

export default class JsonFile {
  id: string

  constructor () {

  }

  static get jsonPath(): string {
    return '';
  }

  static async getList<T>(): Promise<T[]> {
    const file = await fs.readFile(this.jsonPath);
    const jsonEntries = JSON.parse(file.toString());
    return jsonEntries.map(jsonEntry => {
      const entry = new this();
      Object.assign(entry, jsonEntry);
      return entry;
    });
  }

  static async saveList<T>(entries: T[]) {
    await fs.writeFile(this.jsonPath, JSON.stringify(entries, null, 2));
  }

  static async getById<T>(id: string): Promise<T> {
    const entries = await this.getList<T>();
    return entries.find(entry => entry['id'] === id);
  }

  /**
   * Add a new entry and save the Json file
   * @param entry
   */
  static async addEntry<T>(entry: T): Promise<void> {
    const entries: T[] = await this.getList<T>();
    entries.push(entry);
    await this.saveList<T>(entries);
  }
}
