export type ClientType = "stable" | "lazer" | "manual";

export interface StableClientSettings {
  mainPath: string;
  altPath: string;
  altPathEnabled: boolean;
  temp: boolean;
  tempPath: string;
  autoTemp: boolean;
}

export interface LazerClientSettings {
  mainPath: string;
  downloadPath: string;
}

export interface ManualClientSettings {
  mainPath: string;
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
  validPath?: boolean;
};

export type SetClientSetting<T extends ClientType> = (client: T, settings: Partial<ClientPathsSettings[T]>) => void;

