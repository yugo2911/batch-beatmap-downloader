import settings from "electron-settings";
import fs from "fs";
import path from "path";
import os from "os";
import { LAZER_DEFAULT_PATH, checkValidPath } from "./realm";

export const getLazerPath = async (): Promise<string> => {
  const storedPath = (await settings.get("lazerPath")) as string | undefined;
  if (storedPath && fs.existsSync(storedPath)) {
    return storedPath;
  }
  return LAZER_DEFAULT_PATH;
};

export const setLazerPath = async (newPath: string): Promise<boolean> => {
  const valid = await checkValidPath(newPath);
  if (!valid) return false;
  await settings.set("lazerPath", newPath);
  return true;
};

export const getDownloadPath = async (): Promise<string> => {
  const temp = (await settings.get("temp")) as boolean;
  if (temp) {
    return await getTempPath();
  }

  const importFolder = (await settings.get("lazerImportFolder")) as string;
  if (importFolder) {
    return importFolder;
  }

  const lazerPath = await getLazerPath();
  const downloadsPath = path.join(lazerPath, "downloads");

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }

  return downloadsPath;
};

export const getTempPath = async (): Promise<string> => {
  const storedTempPath = (await settings.get("tempPath")) as string;
  if (storedTempPath) return storedTempPath;

  const lazerPath = await getLazerPath();
  const tempPath = path.join(lazerPath, "bbd-temp");

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }

  return tempPath;
};

export const getMaxConcurrentDownloads = async (): Promise<number> => {
  return ((await settings.get("maxConcurrentDownloads")) as number) ?? 3;
};
