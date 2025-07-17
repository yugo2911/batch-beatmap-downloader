import { Client } from "./client";
import fs from "fs";
import { SettingsObject } from "@/models/settings";

export class ManualClient extends Client {
  protected getSettingsListener() {
    return (change: Partial<SettingsObject>) => {
      console.log('Manual client settings changed');
    };
  }

  public getRootPath() {
    const settings = this._settings.getClientSettings("manual");
    return settings.mainPath;
  }

  public getDownloadPath() {
    return this.getRootPath();
  }

  public async loadBeatmaps() {
    const songsPath = this.getDownloadPath();

    try {
      const dir = await fs.promises.readdir(songsPath);

      // get number at start of each file name
      const ids = dir.map((file) => {
        const number = /^\d+/.exec(file);
        return number ? parseInt(number[0]) : 0;
      });

      this._beatmapSets = new Set(ids);
      return this._beatmapSets;
    } catch(err) {
      console.log(err)
      return new Set<number>();
    }
  }

  public async isPathValid() {
    const root = this.getRootPath();

    // check if the root path exists
    try {
      await fs.promises.access(root);
    } catch (err) {
      return false;
    }

    return true;
  }

  public createCollection(name: string, beatmapIds: string[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public supportsCollections(): boolean {
    return false;
  }
}
