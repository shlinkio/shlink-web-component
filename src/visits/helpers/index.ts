import { countBy, groupBy } from '@shlinkio/data-manipulation';
import type { ShlinkOrphanVisit, ShlinkVisit, ShlinkVisitsParams } from '../../api-contract';
import type { ShortUrlIdentifier } from '../../short-urls/data';
import { domainMatches, shortUrlMatches } from '../../short-urls/helpers';
import { formatIsoDate, isBetween } from '../../utils/dates/helpers/date';
import type { DateRange, MandatoryStartDateRange } from '../../utils/dates/helpers/dateIntervals';
import { calcPrevDateRange, isMandatoryStartDateRange } from '../../utils/dates/helpers/dateIntervals';
import type {
  CreateVisit,
  HighlightableProps,
  NormalizedOrphanVisit,
  NormalizedVisit,
  Stats,
  VisitsParams,
} from '../types';

export const isOrphanVisit = (visit: ShlinkVisit): visit is ShlinkOrphanVisit =>
  (visit as ShlinkOrphanVisit).type !== undefined;

export const isNormalizedOrphanVisit = (visit: NormalizedVisit): visit is NormalizedOrphanVisit =>
  (visit as NormalizedOrphanVisit).type !== undefined;

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
 * Filters created visits array by those matching a short URL and date range
 */
export const filterCreatedVisitsByShortUrl = (
  createdVisits: CreateVisit[],
  { shortCode, domain }: ShortUrlIdentifier,
  { endDate, startDate }: DateRange = {},
): CreateVisit[] => createdVisits.filter(
  ({ shortUrl, visit }) =>
    shortUrl && shortUrlMatches(shortUrl, shortCode, domain) && isBetween(visit.date, startDate, endDate),
);

/**
 * Filters created visits array by those matching a domain and date range
 */
export const filterCreatedVisitsByDomain = (
  createdVisits: CreateVisit[],
  domain: string,
  { endDate, startDate }: DateRange = {},
): CreateVisit[] => createdVisits.filter(
  ({ shortUrl, visit }) => shortUrl && domainMatches(shortUrl, domain) && isBetween(visit.date, startDate, endDate),
);

/**
 * Filters created visits array by those matching a domain and date range
 */
export const filterCreatedVisitsByTag = (
  createdVisits: CreateVisit[],
  tag: string,
  { endDate, startDate }: DateRange = {},
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

export const toApiParams = (
  { filter, dateRange }: VisitsParams,
): Omit<ShlinkVisitsParams, 'page' | 'itemsPerPage'> => {
  const { startDate, endDate } = toApiDateRange(dateRange);
  const excludeBots = filter?.excludeBots || undefined;

  return { startDate, endDate, excludeBots };
};

type MandatoryStartDateRangeParams = Omit<VisitsParams, 'dateRange'> & {
  dateRange: MandatoryStartDateRange;
};

export const isMandatoryStartDateRangeParams = (params: VisitsParams): params is MandatoryStartDateRangeParams =>
  isMandatoryStartDateRange(params.dateRange);

export const paramsForPrevDateRange = ({ dateRange, ...rest }: MandatoryStartDateRangeParams): VisitsParams => ({
  ...rest,
  dateRange: calcPrevDateRange(dateRange),
});
