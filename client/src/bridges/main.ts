import {
  contextBridge,
} from "electron";
import { createStoreBindings } from "electron-persist-secure/lib/bindings";
import {
  handleCheckCollections,
  handleCreateDownload,
  handleDeleteDownload,
  handleGetDownloadsStatus,
  handleListenForDownloads,
  handleMoveAllDownloads,
  handlePauseDownload,
  handlePauseDownloads,
  handleResumeDownload,
  handleResumeDownloads,
  handleStartDownload
} from "./downloads";
import { handleGetBeatmapDetails, handleGetMetrics, handleQuery } from "./query";
import {
  handleGetSettings,
  handleSetSetting,
  handleSetSettings,
  handleSetClientSettings
} from "./settings";
import {
  handleBrowse,
  handleGetPlatform,
  handleListenForErrors,
  handleListenForServerDown,
  handleOpenUrl,
  handleQuit,
  handleGetVersion,
  handleOpen,
} from "./system";
import { handleGetApplicationStatus } from "@/bridges/application";

export const handleGenericError = (e: unknown) => {
  if (typeof e === "string") {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  }
};

export const electronBridge = {
  query: handleQuery,
  getMetrics: handleGetMetrics,
  getBeatmapDetails: handleGetBeatmapDetails,

  openUrl: handleOpenUrl,
  open: handleOpen,
  browse: handleBrowse,
  quit: handleQuit,
  getPlatform: handleGetPlatform,
  getVersion: handleGetVersion,

  getSettings: handleGetSettings,
  setSetting: handleSetSetting,
  setSettings: handleSetSettings,
  setClientSettings: handleSetClientSettings,

  getApplicationStatus: handleGetApplicationStatus,

  startDownload: handleStartDownload,
  createDownload: handleCreateDownload,
  pauseDownload: handlePauseDownload,
  pauseDownloads: handlePauseDownloads,
  resumeDownload: handleResumeDownload,
  resumeDownloads: handleResumeDownloads,
  deleteDownload: handleDeleteDownload,
  getDownloadsStatus: handleGetDownloadsStatus,
  checkCollections: handleCheckCollections,
  moveTempDownloads: handleMoveAllDownloads,

  listenForDownloads: handleListenForDownloads,
  listenForErrors: handleListenForErrors,
  listenForServerDown: handleListenForServerDown
};

contextBridge.exposeInMainWorld("electron", electronBridge);

export const storeBridge = createStoreBindings("config"); // "config" = the stores name

contextBridge.exposeInMainWorld("store", {
  ...storeBridge,
});
