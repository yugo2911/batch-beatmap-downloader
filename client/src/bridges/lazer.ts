import { ipcRenderer } from "electron";

export const handleGetSettingsLazer = () =>
  ipcRenderer.invoke("get-settings-lazer") as Promise<unknown>;
export const handleSetLazerPath = (path: string) =>
  ipcRenderer.invoke("set-lazer-path", path) as Promise<[boolean, number]>;
export const handleSetLazerImportFolder = (folder: string) =>
  ipcRenderer.invoke("set-lazer-import-folder", folder);
export const handleBrowseLazer = () =>
  ipcRenderer.invoke("browse-lazer") as Promise<Electron.OpenDialogReturnValue>;
export const handleLoadBeatmapsLazer = () =>
  ipcRenderer.invoke("load-beatmaps-lazer") as Promise<number[]>;
export const handleCheckValidPathLazer = (path: string) =>
  ipcRenderer.invoke("check-valid-path-lazer", path) as Promise<boolean>;
