import React, {
  useState, createContext, useEffect, PropsWithChildren, useContext,
} from 'react';
import { ClientType, SetClientSetting, SettingsObject } from "@/models/settings";

export interface Settings {
  settings: SettingsObject | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsObject>>;
  setSetting: (key: keyof SettingsObject, value: unknown) => void;
  setClientSetting: <T extends ClientType>(client: T, partial: Partial<SettingsObject['clientPaths'][T]>) => void;
  validPath: boolean;
}

const defaultContext: Settings = {
  validPath: true,
  settings: null,
  setSettings: () => {},
  setSetting: () => {},
  setClientSetting: () => {},
};

export const SettingsContext = createContext<Settings>(defaultContext);

const SettingsProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsObject | null>(null)

  async function updateSettings() {
    const res = await window.electron.getSettings();
    setSettings(res);
  }

  useEffect(() => {
    if (!settings) return;
    document.documentElement.classList.toggle('dark', settings.darkMode ?? true);
  }, [settings])

  useEffect(() => {
    void updateSettings();
  }, []);

  async function handleSetSettings(newSettings: SettingsObject) {
    await window.electron.setSettings(newSettings);
    await updateSettings();
  }

  async function handleSetClientSettings<T extends ClientType>(client: T, partial: Partial<SettingsObject['clientPaths'][T]>) {
    await window.electron.setClientSettings(client, partial);
    await updateSettings();
  }

  async function handleSetSetting(key: keyof SettingsObject, value: unknown) {
    await window.electron.setSetting(key, value);
    await updateSettings();
  }

  return (
    <SettingsContext.Provider
      value={{
        validPath: true,
        settings,
        setSettings,
        setSetting: handleSetSetting,
        setClientSetting: handleSetClientSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext)

export default SettingsProvider;
