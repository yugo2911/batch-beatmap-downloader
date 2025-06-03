import { app, ipcMain } from "electron";
import {
  handleCreateDownload,
  handleDeleteDownload,
  handleGetDownloadsStatus,
  handleMoveAllDownloads,
  handlePauseDownload,
  handlePauseDownloads,
  handleResumeDownload,
  handleResumeDownloads,
  handleStartDownload
} from "./downloads";
import { handleGetSettings, handleSetClientSettings, handleSetSetting } from "./settings";
import { handleGetBeatmapDetails, handleGetMetrics, handleQuery } from "./query";
import { handleBrowse, handleGetPlatform } from "./os";
import { handleGetApplicationStatus } from "./application";

export const serverUri = "https://v2.nzbasic.com";
export type E = Electron.IpcMainInvokeEvent;

ipcMain.on("quit", () => app.quit());
ipcMain.handle("get-version", () => app.getVersion())

ipcMain.handle("start-download", handleStartDownload)
ipcMain.handle("get-downloads-status", handleGetDownloadsStatus)
ipcMain.handle("create-download", handleCreateDownload);
ipcMain.handle("resume-download", handleResumeDownload);
ipcMain.handle("resume-downloads", handleResumeDownloads);
ipcMain.handle("pause-download", handlePauseDownload);
ipcMain.handle("pause-downloads", handlePauseDownloads)
ipcMain.handle("delete-download", handleDeleteDownload);
ipcMain.handle("move-all-downloads", handleMoveAllDownloads);

ipcMain.handle("get-settings", handleGetSettings);
ipcMain.handle("set-setting", handleSetSetting);
ipcMain.handle("set-settings", handleSetSetting);
ipcMain.handle("set-client-settings", handleSetClientSettings);

ipcMain.handle("get-application-status", handleGetApplicationStatus)

ipcMain.handle("query", handleQuery);
ipcMain.handle("get-metrics", handleGetMetrics)
ipcMain.handle("get-beatmap-details", handleGetBeatmapDetails);

ipcMain.handle("browse", handleBrowse);
ipcMain.handle("get-platform", handleGetPlatform);
