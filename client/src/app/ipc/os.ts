import { dialog, shell } from "electron";
import os from "os";
import { E } from "@/app/ipc/main";

export const handleBrowse = async () => {
  return await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
}

export const handleOpen = async (event: E, path: string) => {
  await shell.openPath(path);
}

export const handleGetPlatform = () => os.platform();

export const handleOpenUrl = async (event: E, url: string) => {
  await shell.openExternal(url);
}
