import { createContext, useContext } from 'react';
import type { ShortUrlsOrder } from '../short-urls/data';
import type { TagsOrder } from '../tags/data/TagsListChildrenProps';
import type { DateInterval } from './dates/helpers/dateIntervals';

export const DEFAULT_SHORT_URLS_ORDERING: ShortUrlsOrder = {
  field: 'dateCreated',
  dir: 'DESC',
};

/**
 * Important! When adding new props in the main Settings interface or any of the nested props, they have to be set as
 * optional, as old instances of the app will load partial objects from local storage until it is saved again.
 */

export interface RealTimeUpdatesSettings {
  enabled: boolean;
  interval?: number;
}

export type TagFilteringMode = 'startsWith' | 'includes';

export interface ShortUrlCreationSettings {
  validateUrls: boolean;
  tagFilteringMode?: TagFilteringMode;
  forwardQuery?: boolean;
}

export interface VisitsSettings {
  defaultInterval: DateInterval;
  excludeBots?: boolean;
  loadPrevInterval?: boolean;
}

export interface TagsSettings {
  defaultOrdering?: TagsOrder;
}

export interface ShortUrlsListSettings {
  defaultOrdering?: ShortUrlsOrder;
}

export interface Settings {
  realTimeUpdates?: RealTimeUpdatesSettings;
  shortUrlCreation?: ShortUrlCreationSettings;
  shortUrlsList?: ShortUrlsListSettings;
  visits?: VisitsSettings;
  tags?: TagsSettings;
}

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
