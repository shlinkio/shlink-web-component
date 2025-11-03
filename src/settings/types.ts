import type { Order, Theme } from '@shlinkio/shlink-frontend-kit';

export type DateInterval = 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'last90Days' | 'last180Days' | 'last365Days' | 'all';

/**
 * Important! When adding new props in the main Settings interface or any of the nested props, they have to be set as
 * optional, as old instances of the app will load partial objects from local storage until it is saved again.
 */

export type RealTimeUpdatesSettings = {
  enabled: boolean;
  interval?: number;
};

export type TagFilteringMode = 'startsWith' | 'includes';

export type ShortUrlCreationSettings = {
  tagFilteringMode?: TagFilteringMode;
  forwardQuery?: boolean;
};

export type VisitsSettings = {
  defaultInterval: DateInterval;
  excludeBots?: boolean;
  loadPrevInterval?: boolean;
};

export type VisitsColumn =
  | 'potentialBot'
  | 'date'
  | 'country'
  | 'region'
  | 'city'
  | 'browser'
  | 'os'
  | 'userAgent'
  | 'referer'
  | 'visitedUrl';

export type VisitsListSettings = {
  columns: Partial<Record<VisitsColumn, boolean>>;
};

export type TagsSettings = {
  defaultOrdering?: Order<'tag' | 'shortUrls' | 'visits'>;
};

export type ShortUrlsListSettings = {
  defaultOrdering?: Order<'dateCreated' | 'shortCode' | 'longUrl' | 'title' | 'visits'>;
  confirmDeletions?: boolean;
};

export type UiSettings = {
  theme: Theme;
};

export type QrCodeFormat = 'png' | 'svg' | 'jpeg' | 'webp';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type QrCodeSettings = {
  size: number;
  format: QrCodeFormat;
  margin: number;
  errorCorrection: QrErrorCorrection;
  color: string;
  bgColor: string;
  logo?: { url: string; name: string };
};

export type Settings = {
  realTimeUpdates?: RealTimeUpdatesSettings;
  shortUrlCreation?: ShortUrlCreationSettings;
  shortUrlsList?: ShortUrlsListSettings;
  visits?: VisitsSettings;
  visitsList?: VisitsListSettings;
  tags?: TagsSettings;
  ui?: UiSettings;
  qrCodes?: QrCodeSettings;
};
