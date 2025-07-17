import Realm from "realm";
import { RealmBeatmapSet, RealmCollection } from "@/app/clients/lazer/realm/models";
import fs from "fs/promises";

export class LazerDB {
  private _realm: Realm | null = null;

  private constructor(private readonly realm: Realm) {
    this._realm = realm;
  }

  public static async open(path: string) {
    try {
      const check = await fs.access(path)
    } catch (e) {
      throw new Error(`Realm path does not exist: ${path}`);
    }

    const realm = await Realm.open({
      path,
    });

    return new LazerDB(realm);
  }

  public close(): void {
    if (this._realm) {
      this._realm.close();
      this._realm = null;
    }
  }

  public getBeatmapSets() {
    if (!this._realm) {
      throw new Error("Realm is not open");
    }

    return this._realm.objects<RealmBeatmapSet>("BeatmapSet");
  }

  public getCollections() {
    if (!this._realm) {
      throw new Error("Realm is not open");
    }

    return this._realm.objects<RealmCollection>("BeatmapCollection");
  }

  public addCollection(name: string, hashes: string[]) {
    if (!this._realm) {
      throw new Error("Realm is not open");
    }

    this._realm.write(() => {
      if (!this._realm) return;

      const collection = this._realm.create<RealmCollection>("BeatmapCollection", {
        Name: name,
        BeatmapMD5Hashes: hashes,
        ID: new Realm.BSON.UUID(),
        LastModified: new Date(),
      });

      return collection;
    });
  }
}
