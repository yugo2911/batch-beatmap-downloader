export type ClientType = "stable" | "lazer" | "manual";

export interface StableClientSettings {
  mainPath: string;
  altPath: string;
  altPathEnabled: boolean;
  validPath: boolean;
  beatmapSetCount: number;
  temp: boolean;
  tempPath: string;
  autoTemp: boolean;
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

export interface DownloadStatus {
  id: string;
  paused: boolean;
  all: number[];
  completed: number[];
  failed: number[];
  skipped: number[];
  totalSize: number;
  totalProgress: number;
  force: boolean;
  speed: number;
}

export interface Downloads {
  [key: string]: {
    status: DownloadStatus
  };
}

export type SettingsObject = {
  darkMode: boolean;
  maxConcurrentDownloads: number;
  autoTransfer: boolean;
  client: ClientType;
  clientPaths: ClientPathsSettings;
  clientId: string;
  downloads?: Downloads;
};

export type SetClientSetting<T extends ClientType> = (client: T, settings: Partial<ClientPathsSettings[T]>) => void;

