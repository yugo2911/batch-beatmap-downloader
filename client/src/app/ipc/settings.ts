import { E } from "./main";
import { Application } from "../application";
import { ClientType, SettingsObject } from "@/models/settings";

export const handleGetSettings = () => Application.instance.settings.all();

export const handleSetSetting = (event: E, key: string, value: unknown) => Application.instance.settings.dangerousSet(key, value);
export const handleSetSettings = (event: E, settings: Partial<SettingsObject>) => Application.instance.settings.merge(settings);
export const handleSetClientSettings = <T extends ClientType>(event: E, client: T, settings: Partial<SettingsObject['clientPaths'][T]>) => Application.instance.settings.setClientSettings(client as any, settings);

// export const handleGetTempData = () => Application.instance.client.getTempData();
