import { mergeDeepRight } from '@shlinkio/data-manipulation';
import { stringifyQueryParams, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import { formatIsoDate } from '../../utils/dates/helpers/date';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../../utils/dates/helpers/dateIntervals';
import type { BooleanString } from '../../utils/helpers';
import { parseBooleanToString } from '../../utils/helpers';
import type { DeepPartial } from '../../utils/types';
import type { VisitsFilter } from '../types';

type VisitsRawQuery = Record<string, unknown> & {
  startDate?: string;
  endDate?: string;
  orphanVisitsType?: ShlinkOrphanVisitType;
  excludeBots?: BooleanString;
  loadPrevInterval?: BooleanString;
};

export type VisitsQuery = {
  dateRange?: DateRange;
  visitsFilter: VisitsFilter;
  loadPrevInterval?: boolean;
};

type UpdateQuery = (extra: DeepPartial<VisitsQuery>) => void;

/**
 * For start and end dates, the presence of the keys with value `undefined` has a different meaning than the absence
 * of the keys.
 * When the keys are present, it means the value was manually requested, which in the case of undefined means
 * "beginning of time" and "end of time" respectively.
 * When the keys are not present, callers may decide to fall back to a default value.
 */
const dateFromRangeToQuery = (dateName: keyof DateRange, dateRange?: DateRange): string | undefined => {
  if (!dateRange || !(dateName in dateRange)) {
    return undefined;
  }
  return (dateRange[dateName] && formatIsoDate(dateRange[dateName])) || '';
};

export const useVisitsQuery = (): [VisitsQuery, UpdateQuery] => {
  const navigate = useNavigate();
  const rawQuery = useParsedQuery<VisitsRawQuery>();
  const { startDate, endDate, orphanVisitsType, excludeBots, loadPrevInterval, ...rest } = rawQuery;

  const query = useMemo(
    (): VisitsQuery => ({
      dateRange: startDate != null || endDate != null ? datesToDateRange(startDate, endDate) : undefined,
      visitsFilter: {
        orphanVisitsType,
        excludeBots: excludeBots !== undefined ? excludeBots === 'true' : undefined,
      },
      loadPrevInterval: loadPrevInterval !== undefined ? loadPrevInterval === 'true' : undefined,
    }),
    [endDate, excludeBots, loadPrevInterval, orphanVisitsType, startDate],
  );
  const updateQuery = useCallback((extra: DeepPartial<VisitsQuery>) => {
    const { dateRange, visitsFilter = {}, loadPrevInterval: newLoadPrevInterval } = mergeDeepRight(query, extra);
    const { excludeBots: newExcludeBots, orphanVisitsType: newOrphanVisitsType } = visitsFilter;
    const newQuery: VisitsRawQuery = {
      ...rest, // Merge with rest of existing query so that unknown params are preserved
      startDate: dateFromRangeToQuery('startDate', dateRange),
      endDate: dateFromRangeToQuery('endDate', dateRange),
      excludeBots: newExcludeBots === undefined ? undefined : parseBooleanToString(newExcludeBots),
      orphanVisitsType: newOrphanVisitsType,
      loadPrevInterval: newLoadPrevInterval === undefined ? undefined : parseBooleanToString(newLoadPrevInterval),
    };
    const stringifiedQuery = stringifyQueryParams(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(queryString, { replace: true, relative: 'route' });
  }, [query, navigate, rest]);

  return [query, updateQuery];
};
