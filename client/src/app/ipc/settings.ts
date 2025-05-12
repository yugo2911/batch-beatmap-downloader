import { E } from "./main";
import { Application } from "@/app/application";

export const handleGetSettings = () => Application.instance.settings.all();

export const handleSetSetting = (event: E, key: string, value: unknown) => Application.instance.settings.dangerousSet(key, value);
