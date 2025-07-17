export enum Feature {
  DOWNLOAD = "download",
}

export enum ErrorCode {
  INVALID_PATH = "invalidPath",
  INVALID_ALT_PATH = "invalidAltPath",
}

export type ApplicationStatus = {
  stats: {
    beatmapSets: number;
    lazerWarningCount?: number; // Only applicable for Lazer client
  };
  disabled: Partial<Record<Feature, boolean>>;
  errors: Partial<Record<ErrorCode, boolean>>;
  messages: Partial<Record<ErrorCode, string>>;
};

export type ApplicationError = {
  disable: Feature[];
  code: ErrorCode;
  message: string;
};
