import { electronBridge, storeBridge } from "./bridges/main";

declare global {
  interface Window {
    electron: typeof electronBridge;
    store: typeof storeBridge;
  }
}

declare module "*.png";
declare module "*.svg";
