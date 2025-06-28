import { E } from "./main";
import { Application } from "../application";
import { ClientType, SettingsObject } from "@/models/settings";

export const handleGetSettings = () => Application.instance.settings.all();

export const handleSetSetting = <T extends keyof SettingsObject>(event: E, key: T, value: SettingsObject[T]) => Application.instance.settings.set(key, value);
export const handleSetSettings = (event: E, settings: Partial<SettingsObject>) => Application.instance.settings.merge(settings);
export const handleSetClientSettings = <T extends ClientType>(event: E, client: T, settings: Partial<SettingsObject['clientPaths'][T]>) => Application.instance.settings.setClientSettings(client as any, settings);

// export const handleGetTempData = () => Application.instance.client.getTempData();
