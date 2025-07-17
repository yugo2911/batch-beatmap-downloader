import {
  ipcRenderer,
  shell,
  OpenExternalOptions,
} from "electron";

export const handleGetVersion = () => ipcRenderer.invoke("get-version") as Promise<string>;
export const handleBrowse = () => ipcRenderer.invoke("browse") as Promise<Electron.OpenDialogReturnValue>;
export const handleOpen = (path: string) => ipcRenderer.invoke("open", path) as Promise<void>;
export const handleOpenUrl = (url: string, options?: OpenExternalOptions) => ipcRenderer.invoke("open-url", url) as Promise<void>;
export const handleQuit = () => ipcRenderer.send("quit");
export const handleListenForErrors = (callback: (error: string) => void) => {
  const listener = (event: any, error: string) => {
    callback(error);
  };
  
  ipcRenderer.on("error", listener);
  
  // Return cleanup function
  return () => {
    ipcRenderer.removeListener("error", listener);
  };
};

export const handleListenForServerDown = (callback: (down: boolean) => void) => {
  const listener = (event: any, down: boolean) => {
    callback(down);
  };
  
  ipcRenderer.on("server-down", listener);
  
  // Return cleanup function
  return () => {
    ipcRenderer.removeListener("server-down", listener);
  };
};

export const handleGetPlatform = () => ipcRenderer.invoke("get-platform") as Promise<NodeJS.Platform>;
