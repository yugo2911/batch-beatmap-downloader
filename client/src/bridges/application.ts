import { ipcRenderer } from "electron";
import { ApplicationStatus } from "@/models/application";

export const handleGetApplicationStatus = () => ipcRenderer.invoke("get-application-status") as Promise<ApplicationStatus>;
