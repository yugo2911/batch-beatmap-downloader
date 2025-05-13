import { ipcRenderer } from "electron";
import { ClientType, SettingsObject } from "@/models/settings";
import { TempData } from "@/models/ipc";

export const handleGetSettings = () => ipcRenderer.invoke("get-settings") as Promise<SettingsObject>;
export const handleSetSettings = (settings: SettingsObject) => ipcRenderer.invoke("set-settings", settings);
export const handleSetSetting = (key: string, value: unknown) => ipcRenderer.invoke("set-setting", key, value);
export const handleSetClientSettings = <T extends ClientType>(client: T, settings: Partial<SettingsObject["clientPaths"][T]>) => ipcRenderer.invoke("set-client-settings", client, settings);

// export const handleCheckValidPath = () => ipcRenderer.invoke("check-valid-path");
// export const handleLoadBeatmaps = () => ipcRenderer.invoke("load-beatmaps") as Promise<number[]>;
export const handleGetTempData = () => ipcRenderer.invoke("get-temp-data") as Promise<TempData>;
export const handleResetTempPath = () => ipcRenderer.invoke("reset-temp-path") as Promise<void>;
