import { dialog } from "electron";
import os from "os";

export const handleBrowse = async () => {
  return await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
}

export const handleGetPlatform = () => os.platform();
