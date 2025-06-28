import { Client } from "../client";
import fs from "fs";
import path from "path";
import { LazerDB } from "./realm/db";
import { SettingsObject } from "@/models/settings";

export class LazerClient extends Client {
  private _db: LazerDB | null = null;

  protected getSettingsListener() {
    return (change: Partial<SettingsObject>) => {
      if (change.clientPaths?.lazer.mainPath) {
        this._db?.close();
        this._db = null;
        void this.loadBeatmaps();
      }
    };
  }

  public getRootPath(): string {
    const settings = this._settings.getClientSettings("lazer");
    return settings.mainPath;
  }

  public getDownloadPath(): string {
    return path.join(this.getRootPath(), "BBD-Downloads");
  }

  public async loadBeatmaps() {
    if (!this._db) {
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

    await this.loadBeatmaps();

    return true;
  }
}
