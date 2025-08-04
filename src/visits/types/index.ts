import type { ShlinkOrphanVisitType, ShlinkShortUrl, ShlinkVisit } from '../../api-contract';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';

export interface ParsedUserAgent {
  browser: string;
  os: string;
}

export interface NormalizedRegularVisit extends ParsedUserAgent {
  date: string;
  userAgent: string;
  referer: string;
  country: string;
  region: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  potentialBot: boolean;
  visitedUrl?: string; // Optional for Shlink older than 4.1.0
}

export interface NormalizedOrphanVisit extends NormalizedRegularVisit {
  visitedUrl: string;
  type: ShlinkOrphanVisitType;
}

export type NormalizedVisit = NormalizedRegularVisit | NormalizedOrphanVisit;

export interface CreateVisit {
  shortUrl?: ShlinkShortUrl;
  visit: ShlinkVisit;
}

export type Stats = Record<string, number>;

export type StatsRow = [string, number];

export interface CityStats {
  cityName: string;
  count: number;
  latLong: [number, number];
}

export interface VisitsStats {
  os: Stats;
  browsers: Stats;
  referrers: Stats;
  countries: Stats;
  cities: Stats;
  citiesForMap: Record<string, CityStats>;
  visitedUrls: Stats;
}

export interface VisitsFilter {
  orphanVisitsType?: ShlinkOrphanVisitType | undefined;
  excludeBots?: boolean;
}

export type VisitsParams = {
  dateRange?: DateRange;
  filter?: VisitsFilter;
};

export type HighlightableProps<T extends NormalizedVisit> = T extends NormalizedOrphanVisit
  ? ('referer' | 'country' | 'city' | 'visitedUrl')
  : ('referer' | 'country' | 'city');
