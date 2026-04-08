import { dialog } from "electron";
import settings from "electron-settings";
import { window } from "../../main";
import { loadBeatmaps as loadLazerBeatmaps } from "../lazer/beatmaps";
import { getLazerPath, setLazerPath } from "../lazer/settings";
import {
  checkValidPath as checkRealmPath,
  LAZER_DEFAULT_PATH,
} from "../lazer/realm";
import { E } from "./main";

export const handleGetSettingsLazer = async () => {
  const storedPath = (await settings.get("lazerPath")) as string | undefined;
  const path = storedPath || LAZER_DEFAULT_PATH;
  const validPath = await checkRealmPath(path);
  const imported = await loadLazerBeatmaps();
  return {
    validPath,
    sets: imported.size,
    lazerPath: path,
    lazerImportFolder: await settings.get("lazerImportFolder"),
    temp: await settings.get("temp"),
    tempPath: await settings.get("tempPath"),
    darkMode: await settings.get("darkMode"),
    maxConcurrentDownloads: await settings.get("maxConcurrentDownloads"),
  };
};

export const handleSetLazerPath = async (
  _event: E,
  path: string,
): Promise<[boolean, number]> => {
  const valid = await setLazerPath(path);
  if (!valid) {
    window?.webContents.send("error", "Could not find client.realm");
    return [false, 0];
  }
  const imported = await loadLazerBeatmaps();
  return [true, imported.size];
};

export const handleSetLazerImportFolder = async (_event: E, folder: string) => {
  await settings.set("lazerImportFolder", folder);
};

export const handleBrowseLazer = async () => {
  const dialogResult = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return dialogResult;
};

export const handleLoadBeatmapsLazer = async () => {
  const imported = await loadLazerBeatmaps();
  return Array.from(imported);
};

export const handleCheckValidPathLazer = async (_event: E, path: string) => {
  return await checkRealmPath(path);
};
