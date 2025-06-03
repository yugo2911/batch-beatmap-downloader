import settings from "electron-settings";
import { ClientType, SettingsObject } from "../models/settings";
import { v4 as uuid } from "uuid";
import merge from 'deepmerge';
import { Application } from "./application";

export class SettingsService {
  private _settings: SettingsObject;

  private _hooks: Record<string, (s: SettingsObject) => void> = {
    "client": (s) => Application.instance.setClientType(s.client),
  }

  public constructor() {
    const s = settings.getSync() as unknown as SettingsObject;

    const loaded: SettingsObject = {
      darkMode: s.darkMode ?? true,
      maxConcurrentDownloads: s.maxConcurrentDownloads ?? 3,
      autoTransfer: s.autoTransfer ?? false,
      client: s.client ?? "stable",
      clientId: s.clientId,
      clientPaths: {
        stable: {
          mainPath: s.clientPaths?.stable?.mainPath ?? null,
          altPath: s.clientPaths?.stable?.altPath ?? null,
          altPathEnabled: s.clientPaths?.stable?.altPathEnabled ?? false,
          tempPath: s.clientPaths?.stable?.tempPath ?? null,
          temp: s.clientPaths?.stable?.temp ?? false,
          autoTemp: s.clientPaths?.stable?.autoTemp ?? false,
          validPath: false,
          beatmapSetCount: 0,
        },
        lazer: {
          songsPath: "",
          validPath: false,
          beatmapSetCount: 0,
        },
        manual: {
          downloadPath: "",
          validPath: false,
          beatmapSetCount: 0,
        },
      },
    };

    if (!loaded.clientId) {
      const newClientId = uuid()
      settings.setSync("clientId", newClientId)
      loaded.clientId = newClientId;
    }

    this._settings = loaded;
  }

  public getClientSettings<C extends ClientType>(client: C) {
    return this._settings.clientPaths[client];
  }

  public all() {
    return this._settings;
  }

  private checkHooks(...keys: string[]) {
    if (keys.length === 0) {
      keys = Object.keys(this._hooks);
    }

    keys.forEach(key => {
      if (this._hooks[key]) {
        console.log(`Running hook for key: ${key}`);
        this._hooks[key](this._settings);
      } else {
        console.warn(`No hook found for key: ${key}`);
      }
    });
  }

  private setSync(key: string, value: unknown) {
    // @ts-expect-error eslint-disable-next-line
    settings.setSync(key, value);
    this.checkHooks(key);
  }
  private setAllSync(obj: Record<string, unknown>) {
    // @ts-expect-error eslint-disable-next-line
    settings.setSync(obj);
    this.checkHooks();
  }

  public setClientSettings<C extends ClientType>(client: C, clientSettings: Partial<SettingsObject['clientPaths'][C]>) {
    const newSettings = {
      ...this._settings.clientPaths[client],
      ...clientSettings,
    };

    this.setSync(`clientPaths.${client}`, newSettings);
    this._settings.clientPaths[client] = newSettings;
  }

  public merge(s: Partial<SettingsObject>) {
    // merge, including nested objects
    const newSettings = merge(this._settings, s);
    this._settings = newSettings;
    this.setAllSync(newSettings);
  }

  public dangerousUnset(key: string) {
    settings.unsetSync(key);
    // @ts-expect-error eslint-disable-next-line
    delete this._settings[key];
    this.checkHooks(key);
  }

  public unset(key: keyof SettingsObject) {
    settings.unsetSync(key);
    delete this._settings[key];
    this.checkHooks(key);
  }

  public dangerousSet(key: string, value: unknown) {
    // @ts-expect-error eslint-disable-next-line
    this._settings[key] = value;
    this.setSync(key, value);
  }

  public set<K extends keyof SettingsObject>(key: K, value: SettingsObject[K]) {
    this._settings[key] = value;
    this.setSync(key, value);
  }

  public get<K extends keyof SettingsObject>(key: K): SettingsObject[K] {
    return this._settings[key];
  }
}

