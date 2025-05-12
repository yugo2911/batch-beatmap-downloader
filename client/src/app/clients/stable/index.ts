import fs from "fs";
import os from "os";
import { Client } from "@/app/clients/client";
import path from "path";
import settings from "electron-settings";
import { readCollections, writeCollections } from "@/app/clients/stable/collection/parse";
import { window } from "@/main";
import { cloneDeep } from "lodash";
import { Application } from "@/app/application";

export class StableClient extends Client {
  public getRootPath() {
    const settings = this._settings.getClientSettings("stable");
    return settings.mainPath;
  }

  public getSongsPath() {
    const root = this.getRootPath();
    const settings = this._settings.getClientSettings("stable");

    if (settings.altPathEnabled) {
      return settings.altPath;
    }

    return path.join(root, "Songs");
  }

  public getDownloadPath() {
    const settings = this._settings.getClientSettings("stable");

    if (settings.temp) {
      return settings.tempPath;
    }

    if (settings.altPathEnabled) {
      return settings.altPath;
    }

    return path.join(this.getRootPath(), "Songs");
  }

  public async isPathValid() {
    try {
      const root = this.getRootPath();
      const files = await fs.promises.readdir(root);
      if (!files.includes("collection.db")) return false;
    } catch(err) {
      return false;
    }

    return true
  }

  public async loadBeatmaps() {
    const songsPath = this.getSongsPath();

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

  public checkValidTempPath(tempPath: string, songsPath: string) {
    const absoluteTempPath = path.resolve(tempPath);
    const absoluteSongsPath = path.resolve(songsPath);

    if (os.platform() === "win32") {
      const tempDrive = absoluteTempPath.split(":")[0].toLowerCase();
      const songsDrive = absoluteSongsPath.split(":")[0].toLowerCase();
      return tempDrive === songsDrive;
    }

    try {
      const tempStats = fs.statSync(absoluteTempPath);
      const songsStats = fs.statSync(absoluteSongsPath);

      // If the device IDs match, they're on the same filesystem
      return tempStats.dev === songsStats.dev;
    } catch (err) {
      console.error("Error checking temp path validity:", err);
      return false;
    }
  }

  public async getTempPathDetails() {
    const settings = this._settings.getClientSettings("stable");

    const tempEnabled = settings.temp;
    const tempAuto = settings.autoTemp;
    const tempPath = settings.tempPath;
    const mainPath = settings.mainPath;

    const exists = tempPath ?
      await fs.promises.access(tempPath).then(() => true).catch(() => false) :
      false;

    const files = exists ? await fs.promises.readdir(tempPath) : [];
    const valid = exists ? this.checkValidTempPath(tempPath, mainPath) : false;

    return {
      valid,
      enabled: tempEnabled ?? false,
      path: tempPath,
      count: files.filter(file => file.endsWith(".osz")).length,
      auto: tempAuto ?? false
    };
  }

  public async moveTempFiles(sets?: number[]) {
    const details = await this.getTempPathDetails();
    if (!details.valid) return;
    if (!details.enabled) return;

    const tempPath = details.path;
    const songsPath = this.getSongsPath();


    if (sets) {
      for (const set of sets) {
        const oldPath = path.join(tempPath, `${set}.osz`);
        const newPath = path.join(songsPath, `${set}.osz`);
        await fs.promises.rename(oldPath, newPath)
      }
    } else {
      // move all files from temp path to songs path
      const files = await fs.promises.readdir(tempPath);
      await Promise.all(files.map(file => {
        if (!file.endsWith(".osz")) return
        const oldPath = path.join(tempPath, file);
        const newPath = path.join(songsPath, file);
        return fs.promises.rename(oldPath, newPath);
      }))
    }
  }

  public async addCollection(hashes: string[], name: string) {
    const rootPath = this.getRootPath();
    const collectionPath = path.join(rootPath, "collection.db");

    const backup = await readCollections(collectionPath)
    const newCollections = cloneDeep(backup)

    newCollections.collections.push({
      name,
      numberMaps: hashes.length,
      hashes,
    });
    newCollections.numberCollections++;

    await writeCollections(collectionPath, newCollections)
    const testWrite = await readCollections(collectionPath)

    // some unreproducible write error occurred at one point which caused garbage values to be written to disk
    if (testWrite.numberCollections !== newCollections.numberCollections) {
      Application.instance.emit("error", "Something went wrong when creating the new collection. Backup was restored.")
      await writeCollections(collectionPath, backup)
    }
  }
}
