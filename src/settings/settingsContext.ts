import { createContext, useContext } from 'react';
import type { ShortUrlsOrder } from '../short-urls/data';
import type { Settings } from '.';

export const DEFAULT_SHORT_URLS_ORDERING: ShortUrlsOrder = {
  field: 'dateCreated',
  dir: 'DESC',
};

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
    defaultOrdering: DEFAULT_SHORT_URLS_ORDERING,
  },
};

const SettingsContext = createContext<Settings | undefined>(defaultSettings);

export const SettingsProvider = SettingsContext.Provider;

export const useSettings = (): Settings => useContext(SettingsContext) ?? defaultSettings;

export const useSetting = <T extends keyof Settings>(settingName: T): Settings[T] => {
  const settings = useSettings();
  return settings[settingName];
};
