import settings from "electron-settings";
import { ClientType, SettingsObject } from "../models/settings";
import { v4 as uuid } from "uuid";
import merge from 'deepmerge';
import { cloneDeep } from "lodash";
import { updatedDiff } from 'deep-object-diff';

export type SettingsListener = (change: Partial<SettingsObject>) => void;

export class SettingsService {
  private _settings: SettingsObject;
  private _listeners: SettingsListener[] = [];
  private _before: SettingsObject;

  public register(listener: SettingsListener) {
    this._listeners.push(listener);
  }

  public unregister(listener: SettingsListener) {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  private notify(change: Partial<SettingsObject>) {
    this._listeners.forEach(listener => listener(change));
  }

  private begin() {
    this._before = cloneDeep({ ...this._settings });
  }

  private commit() {
    this.setAllSync(this._settings);

    const diff = updatedDiff(this._before, this._settings);

    if (Object.keys(diff).length > 0) {
      this.notify(diff);
    }
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
        },
        lazer: {
          mainPath: s.clientPaths?.lazer?.mainPath ?? null,
          downloadPath: '',
        },
        manual: {
          mainPath: s.clientPaths?.manual?.mainPath ?? '',
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

  private setSync(key: string, value: unknown) {
    // @ts-expect-error eslint-disable-next-line
    settings.setSync(key, value);
  }
  private setAllSync(obj: Record<string, unknown>) {
    // @ts-expect-error eslint-disable-next-line
    settings.setSync(obj);
  }

  public setClientSettings<C extends ClientType>(client: C, clientSettings: Partial<SettingsObject['clientPaths'][C]>) {
    this.begin();

    this._settings.clientPaths[client] = {
      ...this._settings.clientPaths[client],
      ...clientSettings,
    };

    this.commit();
  }

  public merge(s: Partial<SettingsObject>) {
    this.begin();

    this._settings = merge(this._settings, s);

    this.commit();
  }

  public dangerousUnset(key: string) {
    settings.unsetSync(key);
    // @ts-expect-error eslint-disable-next-line
    delete this._settings[key];
  }

  public unset(key: keyof SettingsObject) {
    settings.unsetSync(key);
    delete this._settings[key];
  }

  public dangerousSet(key: string, value: unknown) {
    this.begin();

    // @ts-expect-error eslint-disable-next-line
    this._settings[key] = value;

    this.commit();
  }

  public set<K extends keyof SettingsObject>(key: K, value: SettingsObject[K]) {
    this.begin();

    this._settings[key] = value;

    this.commit();
  }

  public get<K extends keyof SettingsObject>(key: K): SettingsObject[K] {
    return this._settings[key];
  }
}
