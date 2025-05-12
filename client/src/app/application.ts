import { Client } from "@/app/clients/client";
import { SettingsService } from "@/app/settings";
import { StableClient } from "@/app/clients/stable";
import { ManualClient } from "@/app/clients/manual";
import { LazerClient } from "@/app/clients/lazer";
import { ClientType } from "@/models/settings";
import { DownloadsService } from "@/app/downloads";
import { convertStatus } from "@/app/download/util";
import { window } from "@/main";

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

  public set client(client: Client) {
    this._client = client;

    this._downloads.setClient(client);
  }

  public get client(): Client {
    return this._client;
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
}
