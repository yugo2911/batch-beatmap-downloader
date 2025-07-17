import React, {
  useState, createContext, useEffect, PropsWithChildren, useContext,
} from 'react';
import { ClientType, SettingsObject } from "@/models/settings";
import { ApplicationStatus } from "@/models/application";

export interface Settings {
  settings: SettingsObject | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsObject>>;
  setSetting: (key: keyof SettingsObject, value: unknown) => void;
  setClientSetting: <T extends ClientType>(client: T, partial: Partial<SettingsObject['clientPaths'][T]>) => void;
  status: ApplicationStatus;
}

const defaultApplicationStatus: ApplicationStatus = {
  stats: {
    beatmapSets: 0,
  },
  errors: {},
  disabled: {},
  messages: {},
}

const defaultContext: Settings = {
  settings: null,
  setSettings: () => {},
  setSetting: () => {},
  setClientSetting: () => {},
  status: defaultApplicationStatus
};

export const SettingsContext = createContext<Settings>(defaultContext);

const SettingsProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsObject | null>(null)
  const [status, setStatus] = useState<ApplicationStatus>(defaultApplicationStatus);

  async function updateSettings() {
    const res = await window.electron.getSettings();
    setSettings(res);

    await updateStatus();
  }

  async function updateStatus() {
    const res = await window.electron.getApplicationStatus();
    setStatus(res);
  }

  useEffect(() => {
    if (!settings) return;
    document.documentElement.classList.toggle('dark', settings.darkMode ?? true);

    const interval = setInterval(() => {
      void updateStatus();
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  }, [settings])

  useEffect(() => {
    void updateSettings()
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
        settings,
        setSettings,
        setSetting: handleSetSetting,
        setClientSetting: handleSetClientSettings,
        status,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext)

export default SettingsProvider;
