import { countBy, groupBy } from '@shlinkio/data-manipulation';
import type { ShlinkOrphanVisit, ShlinkVisit, ShlinkVisitsParams } from '../../api-contract';
import type { ShortUrlIdentifier } from '../../short-urls/data';
import { domainMatches, shortUrlMatches } from '../../short-urls/helpers';
import { formatIsoDate, isBetween } from '../../utils/dates/helpers/date';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';
import type {
  CreateVisit,
  HighlightableProps,
  NormalizedOrphanVisit,
  NormalizedVisit,
  Stats,
  VisitsParams,
  VisitsQueryParams,
} from '../types';

export const isOrphanVisit = (visit: ShlinkVisit): visit is ShlinkOrphanVisit =>
  (visit as ShlinkOrphanVisit).visitedUrl !== undefined;

export const isNormalizedOrphanVisit = (visit: NormalizedVisit): visit is NormalizedOrphanVisit =>
  (visit as NormalizedOrphanVisit).visitedUrl !== undefined;

export interface GroupedNewVisits {
  orphanVisits: CreateVisit[];
  nonOrphanVisits: CreateVisit[];
}

export const groupNewVisitsByType = (createdVisits: CreateVisit[]): GroupedNewVisits => {
  const groupedVisits: Partial<GroupedNewVisits> = groupBy(
    createdVisits,
    (newVisit: CreateVisit) => (isOrphanVisit(newVisit.visit) ? 'orphanVisits' : 'nonOrphanVisits'),
  );
  return { orphanVisits: [], nonOrphanVisits: [], ...groupedVisits };
};

/**
 * Filters provided created visits by those matching a short URL and query
 */
export const filterCreatedVisitsByShortUrl = (
  createdVisits: CreateVisit[],
  { shortCode, domain }: ShortUrlIdentifier,
  { endDate, startDate }: VisitsQueryParams,
): CreateVisit[] => createdVisits.filter(
  ({ shortUrl, visit }) =>
    shortUrl && shortUrlMatches(shortUrl, shortCode, domain) && isBetween(visit.date, startDate, endDate),
);

/**
 * Filters provided created visits by those matching a domain and query
 */
export const filterCreatedVisitsByDomain = (
  createdVisits: CreateVisit[],
  domain: string,
  { endDate, startDate }: VisitsQueryParams,
): CreateVisit[] => createdVisits.filter(
  ({ shortUrl, visit }) => shortUrl && domainMatches(shortUrl, domain) && isBetween(visit.date, startDate, endDate),
);

/**
 * Filters provided created visits by those matching a domain and query
 */
export const filterCreatedVisitsByTag = (
  createdVisits: CreateVisit[],
  tag: string,
  { endDate, startDate }: VisitsQueryParams,
): CreateVisit[] => createdVisits.filter(
  ({ shortUrl, visit }) => shortUrl?.tags.includes(tag) && isBetween(visit.date, startDate, endDate),
);

export const highlightedVisitsToStats = <T extends NormalizedVisit>(
  highlightedVisits: T[],
  property: HighlightableProps<T>,
): Stats => countBy(highlightedVisits, (value: any) => value[property]);

export const toApiDateRange = (dateRange?: DateRange): Pick<ShlinkVisitsParams, 'startDate' | 'endDate'> => {
  const startDate = (dateRange?.startDate && formatIsoDate(dateRange?.startDate)) ?? undefined;
  const endDate = (dateRange?.endDate && formatIsoDate(dateRange?.endDate)) ?? undefined;

  return { startDate, endDate };
};

export const toApiParams = ({ page, itemsPerPage, filter, dateRange }: VisitsParams): ShlinkVisitsParams => {
  const { startDate, endDate } = toApiDateRange(dateRange);
  const excludeBots = filter?.excludeBots || undefined;

  return { page, itemsPerPage, startDate, endDate, excludeBots };
};
