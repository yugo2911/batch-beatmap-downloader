import { Client } from "../client";
import fs from "fs";
import path from "path";
import { LazerDB } from "./realm/db";
import { SettingsObject } from "@/models/settings";
import { SettingsService } from "@/app/settings";

export class LazerClient extends Client {
  private _db: LazerDB | null = null;
  
  constructor(protected _settings: SettingsService) {
    super(_settings);

    this._settings.setClientSettings("lazer", { "downloadPath": this.getDownloadPath() });
  }

  protected getSettingsListener() {
    return (change: Partial<SettingsObject>) => {
      if (change.clientPaths?.lazer.mainPath) {

        this._db?.close();
        this._db = null;
        void this.loadBeatmaps();

        this._settings.setClientSettings("lazer", { "downloadPath": this.getDownloadPath() });
      }
    };
  }

  public getRootPath(): string {
    const settings = this._settings.getClientSettings("lazer");
    return settings.mainPath;
  }

  public getDownloadPath(): string {
    return path.join(this.getRootPath(), "downloads");
  }

  public async loadBeatmaps() {
    if (!this._db) {
      if (!await this.isPathValid()) {
        return new Set<number>();
      }

      this._db = await LazerDB.open(
        path.join(this.getRootPath(), "client.realm"),
      );
    }

    return this.beatmapSets;
  }

  public get beatmapSets(): Set<number> {
    if (!this._db) {
      return new Set<number>();
    }

    const sets = this._db.getBeatmapSets();
    const ids = new Set<number>();
    for (const set of sets) {
      ids.add(set.OnlineID);
    }

    return ids;
  }

  public async isPathValid() {
    try {
      const root = this.getRootPath();
      const files = await fs.promises.readdir(root);
      if (!files.includes("client.realm")) return false;
    } catch (err) {
      return false;
    }

    const downloadPath = this.getDownloadPath();

    // Ensure the download path exists
    try {
      await fs.promises.access(downloadPath);
    } catch (err) {
      await fs.promises.mkdir(downloadPath, { recursive: true });
    }

    return true;
  }

  public supportsCollections(): boolean {
    return true;
  }

  public async createCollection(name: string, hashes: string[]) {
    if (!this._db) {
      return;
    }
    
    this._db?.addCollection(name, hashes);
  }

  public getWarningCount(): number {
    // read how many files are in the downloads folder
    const downloadPath = this.getDownloadPath();
    let count = 0;
    try {
      const files = fs.readdirSync(downloadPath);
      count = files.length;
    } catch (err) {
      console.error("Error reading download path:", err);
    }

    return count;
  }
}
