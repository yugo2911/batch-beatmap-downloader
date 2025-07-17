import { Client } from "./clients/client";
import { SettingsService } from "./settings";
import { StableClient } from "./clients/stable";
import { ManualClient } from "./clients/manual";
import { LazerClient } from "./clients/lazer";
import { ClientType } from "../models/settings";
import { DownloadsService } from "./downloads";
import { convertStatus } from "./download/util";
import { window } from "../main";
import { ApplicationStatus } from "@/models/application";

export class Application {
  private static _instance: Application;
  private _client: Client;
  private _settings: SettingsService;
  private _downloads: DownloadsService;
  private _clientFactory: Record<ClientType, () => Client>
  private _clientId: string;

  public static get instance(): Application {
    if (!this._instance) {
      this._instance = new Application();
    }

    return this._instance;
  }

  private constructor() {
    this._settings = new SettingsService();
    this._settings.register((change) => {
      if (change.client) {
        this.setClientType(change.client);
      }
    })

    const clientType = this._settings.get("client");
    this._clientFactory = {
      stable: () => new StableClient(this._settings),
      lazer: () => new LazerClient(this._settings),
      manual: () => new ManualClient(this._settings),
    }

    this._client = this._clientFactory[clientType]();
    this._clientId = this._settings.get("clientId");

    this._downloads = new DownloadsService(this._settings, this._client);
  }

  public setClientType(type: ClientType) {
    if (this._clientFactory[type]) {
      if (this._client) {
        this._client.destroy();
      }

      this._client = this._clientFactory[type]();
      this._downloads.setClient(this._client);
    } else {
      throw new Error(`Unknown client type: ${type}`);
    }
  }

  public set client(client: Client) {
    this._client = client;

    this._downloads.setClient(client);
  }

  public get client(): Client {
    return this._client;
  }

  public get clientId() {
    return this._clientId;
  }

  public get settings() {
    return this._settings;
  }

  public get downloads() {
    return this._downloads;
  }

  public emit(key: string, value: unknown) {
    window?.webContents.send(key, value);
  }

  public emitDownloadStatus() {
    const statuses = this._downloads.getStatuses();
    const mapped = statuses.map(convertStatus);
    this.emit("downloads-status", mapped);
  }

  public async getStatus(): Promise<ApplicationStatus> {
    const errors = await this._client.getErrors();

    const errorPortion = errors.reduce((acc, error) => {
      if (error.disable) {
        error.disable.forEach(action => {
          acc.disabled[action] = true;
        });
      }

      if (error.code) {
        acc.errors[error.code] = true;
      }

      if (error.message) {
        acc.messages[error.code] = error.message;
      }
      return acc;
    }, { messages: {}, errors: {}, disabled: {} } as ApplicationStatus);

    await this._client.loadBeatmaps();

    return {
      ...errorPortion,
      stats: {
        beatmapSets: this._client.beatmapSets.size,
        lazerWarningCount: this._client instanceof LazerClient ? this._client.getWarningCount() : 0,
      }
    }
  }
}
