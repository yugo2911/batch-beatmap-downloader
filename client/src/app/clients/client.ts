import { SettingsListener, SettingsService } from "../settings";
import { ApplicationError, ErrorCode, Feature } from "../../models/application";

export abstract class Client {
  protected _beatmapSets: Set<number>;
  private _settingsListener: SettingsListener | null = null;

  constructor(protected _settings: SettingsService) {
    this._settingsListener = this.getSettingsListener();
    this._settings.register(this._settingsListener);
  }

  public destroy() {
    if (this._settingsListener) {
      this._settings.unregister(this._settingsListener);
      this._settingsListener = null;
    }
  }

  abstract loadBeatmaps(): Promise<Set<number>>;
  abstract isPathValid(): Promise<boolean>;
  abstract getRootPath(): string
  abstract getDownloadPath(): string
  protected abstract getSettingsListener(): SettingsListener;

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

  abstract createCollection(name: string, beatmapIds: string[]): Promise<void>
  abstract supportsCollections(): boolean
}
