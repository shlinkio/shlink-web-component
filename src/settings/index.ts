import { createContext, useContext } from 'react';
import type { Settings } from './types';

const defaultSettings: Settings = {
  realTimeUpdates: {
    enabled: true,
  },
  shortUrlCreation: {
    validateUrls: false,
  },
  visits: {
    defaultInterval: 'last30Days',
  },
  shortUrlsList: {
    defaultOrdering: {
      field: 'dateCreated',
      dir: 'DESC',
    },
  },
};

const SettingsContext = createContext(defaultSettings);

export const { Provider: SettingsProvider } = SettingsContext;

export const useSettings = (): Settings => useContext(SettingsContext) ?? defaultSettings;

export function useSetting<Setting extends keyof Settings>(settingName: Setting): Settings[Setting];
export function useSetting<Setting extends keyof Settings, Default extends NonNullable<Settings[Setting]>>(
  settingName: Setting,
  fallbackValue: Default,
): NonNullable<Settings[Setting]>;
export function useSetting<Setting extends keyof Settings, Default extends Settings[Setting]>(
  settingName: Setting,
  fallbackValue?: Default,
) {
  const settings = useSettings();
  return settings[settingName] ?? fallbackValue;
}

export { ShlinkWebSettings } from './components/ShlinkWebSettings';
export * from './types';
