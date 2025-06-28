import Realm from "realm";
import { RealmBeatmapSet, RealmCollection } from "@/app/clients/lazer/realm/models";

export class LazerDB {
  private _realm: Realm | null = null;

  private constructor(private readonly realm: Realm) {
    this._realm = realm;
  }

  public static async open(path: string) {
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

    return this._realm.objects<RealmCollection>("Collections");
  }
}
