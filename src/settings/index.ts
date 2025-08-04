import { createContext, useContext } from 'react';
import type { QrCodeSettings, Settings, VisitsListSettings } from './types';

export const defaultQrCodeSettings: QrCodeSettings = {
  size: 300,
  margin: 0,
  color: '#000000',
  bgColor: '#ffffff',
  errorCorrection: 'L',
  format: 'png',
} as const;

Object.freeze(defaultQrCodeSettings);

export const defaultVisitsListColumns: Required<VisitsListSettings['columns']> = {
  potentialBot: true,
  date: true,
  country: true,
  region: false,
  city: true,
  browser: true,
  os: true,
  userAgent: false,
  referer: true,
  visitedUrl: true,
} as const;

Object.freeze(defaultVisitsListColumns);

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
  visitsList: {
    columns: defaultVisitsListColumns,
  },
  shortUrlsList: {
    defaultOrdering: {
      field: 'dateCreated',
      dir: 'DESC',
    },
  },
  qrCodes: defaultQrCodeSettings,
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
