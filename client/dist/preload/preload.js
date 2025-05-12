// src/bridges/main.ts
var import_electron5 = require("electron");
var import_bindings = require("electron-persist-secure/lib/bindings");

// src/bridges/downloads.ts
var import_electron = require("electron");
var handleStartDownload = (force, collectionName) => {
  return import_electron.ipcRenderer.invoke("start-download", force, collectionName);
};
var handleCreateDownload = (ids, size, force, hashes, collectionName) => {
  return import_electron.ipcRenderer.invoke("create-download", ids, size, force, hashes, collectionName);
};
var handlePauseDownload = (downloadId) => {
  return import_electron.ipcRenderer.invoke("pause-download", downloadId);
};
var handleCheckCollections = () => {
  return import_electron.ipcRenderer.invoke("check-collections");
};
var handleGetDownloadsStatus = () => {
  return import_electron.ipcRenderer.invoke("get-downloads-status");
};
var handleResumeDownloads = () => {
  return import_electron.ipcRenderer.invoke("resume-downloads");
};
var handleResumeDownload = (downloadId) => {
  return import_electron.ipcRenderer.invoke("resume-download", downloadId);
};
var handlePauseDownloads = () => {
  return import_electron.ipcRenderer.invoke("pause-downloads");
};
var handleDeleteDownload = (downloadId) => {
  return import_electron.ipcRenderer.invoke("delete-download", downloadId);
};
var handleListenForDownloads = (callback) => {
  import_electron.ipcRenderer.on("downloads-status", (event, downloads) => {
    callback(downloads);
  });
};
var handleMoveAllDownloads = () => {
  return import_electron.ipcRenderer.invoke("move-all-downloads");
};

// src/bridges/query.ts
var import_electron2 = require("electron");
var handleQuery = async (node, limit, order) => {
  try {
    const res = await import_electron2.ipcRenderer.invoke(
      "query",
      node,
      limit,
      order
    );
    return res;
  } catch (e) {
    return handleGenericError(e);
  }
};
var handleGetBeatmapDetails = async (page, pageSize) => {
  try {
    const res = await import_electron2.ipcRenderer.invoke(
      "get-beatmap-details",
      page,
      pageSize
    );
    return res;
  } catch (e) {
    return handleGenericError(e);
  }
};
var handleGetMetrics = () => import_electron2.ipcRenderer.invoke("get-metrics");

// src/bridges/settings.ts
var import_electron3 = require("electron");
var handleSetSetting = (name, ...args) => {
  return import_electron3.ipcRenderer.invoke("set-setting", name, ...args);
};
var handleGetVersion = () => import_electron3.ipcRenderer.invoke("get-version");
var handleGetSettings = () => import_electron3.ipcRenderer.invoke("get-settings");
var handleSetSettings = (settings) => import_electron3.ipcRenderer.invoke("set-settings", settings);
var handleCheckValidPath = () => import_electron3.ipcRenderer.invoke("check-valid-path");
var handleLoadBeatmaps = () => import_electron3.ipcRenderer.invoke("load-beatmaps");
var handleGetTempData = () => import_electron3.ipcRenderer.invoke("get-temp-data");
var handleResetTempPath = () => import_electron3.ipcRenderer.invoke("reset-temp-path");

// src/bridges/system.ts
var import_electron4 = require("electron");
var handleBrowse = () => import_electron4.ipcRenderer.invoke("browse");
var handleOpenUrl = (url, options) => import_electron4.shell.openExternal(url, options);
var handleQuit = () => import_electron4.ipcRenderer.send("quit");
var handleListenForErrors = (callback) => {
  import_electron4.ipcRenderer.on("error", (event, error) => {
    callback(error);
  });
};
var handleListenForServerDown = (callback) => {
  import_electron4.ipcRenderer.on("server-down", (event, down) => {
    callback(down);
  });
};
var handleGetPlatform = () => import_electron4.ipcRenderer.invoke("get-platform");

// src/bridges/main.ts
var handleGenericError = (e) => {
  if (typeof e === "string") {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  }
};
var electronBridge = {
  query: handleQuery,
  getMetrics: handleGetMetrics,
  getBeatmapDetails: handleGetBeatmapDetails,
  openUrl: handleOpenUrl,
  browse: handleBrowse,
  quit: handleQuit,
  getPlatform: handleGetPlatform,
  getVersion: handleGetVersion,
  getSettings: handleGetSettings,
  setSettings: handleSetSettings,
  checkValidPath: handleCheckValidPath,
  loadBeatmaps: handleLoadBeatmaps,
  setSetting: handleSetSetting,
  startDownload: handleStartDownload,
  createDownload: handleCreateDownload,
  pauseDownload: handlePauseDownload,
  pauseDownloads: handlePauseDownloads,
  resumeDownload: handleResumeDownload,
  resumeDownloads: handleResumeDownloads,
  deleteDownload: handleDeleteDownload,
  getDownloadsStatus: handleGetDownloadsStatus,
  checkCollections: handleCheckCollections,
  getTempData: handleGetTempData,
  resetTempPath: handleResetTempPath,
  moveTempDownloads: handleMoveAllDownloads,
  listenForDownloads: handleListenForDownloads,
  listenForErrors: handleListenForErrors,
  listenForServerDown: handleListenForServerDown
};
import_electron5.contextBridge.exposeInMainWorld("electron", electronBridge);
var storeBridge = (0, import_bindings.createStoreBindings)("config");
import_electron5.contextBridge.exposeInMainWorld("store", {
  ...storeBridge
});
