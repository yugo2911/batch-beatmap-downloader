import { SettingsService } from "../settings";
import { ApplicationError, ErrorCode, Feature } from "../../models/application";

export abstract class Client {
  protected _beatmapSets: Set<number>;

  constructor(protected _settings: SettingsService) {}

  abstract loadBeatmaps(): Promise<Set<number>>;
  abstract isPathValid(): Promise<boolean>;

  public async getErrors(): Promise<ApplicationError[]> {
    const errors: ApplicationError[] = [];

    if (!(await this.isPathValid())) {
      errors.push({
        disable: [Feature.DOWNLOAD],
        code: ErrorCode.INVALID_PATH,
        message: "The path to the osu! client is invalid. Please check your settings.",
      });
    }

    return errors;
  }

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
