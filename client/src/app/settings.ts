import settings from "electron-settings";
import fs from 'fs';
import os from 'os';
import path from "path";

export const checkValidPath = async (path: string) => {
  try {
    const files = await fs.promises.readdir(path);
    if (!files.includes("collection.db")) {
      return false;
    }
  } catch(err) {
    return false;
  }

  return true
};

export const checkValidTempPath = async (path: string) => {
  const platform = os.platform();
  if (platform !== "win32") return true;

  const songsPath = await getSongsFolder();

  // check drive letters are the same
  const songsDrive = songsPath.split(":")[0];
  const tempDrive = path.split(":")[0];

  return songsDrive === tempDrive
}

export const getSongsFolder = async () => {
  const altPathEnabled = await settings.get("altPathEnabled") as boolean;

  if (altPathEnabled) {
    const altPath = await settings.get("altPath") as string;
    return altPath;
  }

  const osuPath = await settings.get("path") as string;
  if (!osuPath) return "";
  return path.join(osuPath, "Songs")
}

export const getDefaultTempPath = async () => {
  const altPathEnabled = await settings.get("altPathEnabled") as boolean
  if (altPathEnabled) return "";

  const osuPath = await settings.get("path") as string | undefined;
  if (!osuPath) return "";

  const tempPath = path.join(osuPath, "bbd-temp")

  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
  }

  return tempPath;
}

export const getTempPath = async () => {
  const tempPath = await settings.get("tempPath") as string
  if (tempPath) return tempPath
  return getDefaultTempPath();
}

export const getDownloadPath = async () => {
  const temp = await settings.get("temp") as boolean
  if (!temp) {
    const songsFolder = await getSongsFolder();
    return songsFolder || "";
  }
  const tp = await getTempPath();
  return tp || "";
};

export const getMaxConcurrentDownloads = async () => {
  return (await settings.get("maxConcurrentDownloads") as number)??3
}
