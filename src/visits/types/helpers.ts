import { countBy, groupBy } from '@shlinkio/data-manipulation';
import type { ShlinkOrphanVisit, ShlinkVisit, ShlinkVisitsParams } from '../../api-contract';
import { formatIsoDate } from '../../utils/dates/helpers/date';
import type { CreateVisit, NormalizedOrphanVisit, NormalizedVisit, Stats, VisitsParams } from './index';

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

export type HighlightableProps<T extends NormalizedVisit> = T extends NormalizedOrphanVisit
  ? ('referer' | 'country' | 'city' | 'visitedUrl')
  : ('referer' | 'country' | 'city');

export const highlightedVisitsToStats = <T extends NormalizedVisit>(
  highlightedVisits: T[],
  property: HighlightableProps<T>,
): Stats => countBy(highlightedVisits, (value: any) => value[property]);

export const toApiParams = ({ page, itemsPerPage, filter, dateRange }: VisitsParams): ShlinkVisitsParams => {
  const startDate = (dateRange?.startDate && formatIsoDate(dateRange?.startDate)) ?? undefined;
  const endDate = (dateRange?.endDate && formatIsoDate(dateRange?.endDate)) ?? undefined;
  const excludeBots = filter?.excludeBots || undefined;

  return { page, itemsPerPage, startDate, endDate, excludeBots };
};
