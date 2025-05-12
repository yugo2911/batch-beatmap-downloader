import { debounce } from 'lodash';
import React, {
  useState, createContext, useEffect, PropsWithChildren, useContext,
} from 'react';
import { SettingsObject } from "../../models/settings";

export interface Settings {
  settings: SettingsObject | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsObject>>;
}

const defaultContext: Settings = {
  settings: null,
  setSettings: () => {},
};

export const SettingsContext = createContext<Settings>(defaultContext);

const SettingsProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsObject | null>(null)

  useEffect(() => {
    window.electron.getSettings().then((res) => {
      document.documentElement.classList.toggle('dark', res.darkMode ?? true);
    });
  }, []);

  function handleSetSettings(newSettings: SettingsObject) {
    setSettings(newSettings);
    window.electron.setSettings(newSettings);
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext)

export default SettingsProvider;
