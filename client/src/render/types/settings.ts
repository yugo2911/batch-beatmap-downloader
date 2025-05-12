
export type ClientType = "stable" | "lazer" | "manual";

export interface StableClientSettings {
  mainPath: string;
  altPath: string;
  altPathEnabled: boolean;
  validPath: boolean;
  beatmapSetCount: number;
}

export interface LazerClientSettings {
  songsPath: string;
  validPath: boolean;
  beatmapSetCount: number;
}

export interface ManualClientSettings {
  downloadPath: string;
  validPath: boolean;
  beatmapSetCount: number;
}

export interface ClientPathsSettings {
  stable: StableClientSettings;
  lazer: LazerClientSettings;
  manual: ManualClientSettings;
}

export type SettingsObject = {
  darkMode: boolean;
  maxConcurrentDownloads: number;
  autoTransfer: boolean;
  client: ClientType;
  clientPaths: ClientPathsSettings;
};
