import { SettingsService } from "@/app/settings";

export abstract class Client {
  protected _beatmapSets: Set<number>;

  constructor(protected _settings: SettingsService) {}

  abstract loadBeatmaps(): Promise<Set<number>>;
  abstract isPathValid(): Promise<boolean>;

  public get beatmapSets(): Set<number> {
    if (!this._beatmapSets) {
      this._beatmapSets = new Set<number>();
    }
    return this._beatmapSets;
  }

  public createCollection(name: string, beatmapIds: string[]): Promise<void> {
    return new Promise(() => {});
  }

  public supportsCollections() {
    return false;
  }

  public getRootPath() {
    return "";
  }

  public getDownloadPath() {
    return "";
  }
}
