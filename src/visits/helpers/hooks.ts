import { mergeDeepRight } from '@shlinkio/data-manipulation';
import { stringifyQuery, useParsedQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import { formatIsoDate } from '../../utils/dates/helpers/date';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../../utils/dates/helpers/dateIntervals';
import type { BooleanString } from '../../utils/helpers';
import { parseBooleanToString } from '../../utils/helpers';
import type { DeepPartial } from '../../utils/types';
import type { VisitsFilter } from '../types';

type VisitsQuery = Record<string, unknown> & {
  startDate?: string;
  endDate?: string;
  orphanVisitsType?: ShlinkOrphanVisitType;
  excludeBots?: BooleanString;
};

type VisitsFiltering = {
  dateRange?: DateRange;
  visitsFilter: VisitsFilter;
};

type UpdateFiltering = (extra: DeepPartial<VisitsFiltering>) => void;

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

export const useVisitsQuery = (): [VisitsFiltering, UpdateFiltering] => {
  const navigate = useNavigate();
  const { startDate, endDate, orphanVisitsType, excludeBots, ...rest } = useParsedQuery<VisitsQuery>();

  const filtering = useMemo(
    (): VisitsFiltering => ({
      dateRange: startDate != null || endDate != null ? datesToDateRange(startDate, endDate) : undefined,
      visitsFilter: {
        orphanVisitsType,
        excludeBots: excludeBots !== undefined ? excludeBots === 'true' : undefined,
      },
    }),
    [endDate, excludeBots, orphanVisitsType, startDate],
  );
  const updateFiltering = useCallback((extra: DeepPartial<VisitsFiltering>) => {
    const { dateRange, visitsFilter = {} } = mergeDeepRight(filtering, extra);
    const { excludeBots: newExcludeBots, orphanVisitsType: newOrphanVisitsType } = visitsFilter;
    const newQuery: VisitsQuery = {
      ...rest, // Merge with rest of existing query so that unknown params are preserved
      startDate: dateFromRangeToQuery('startDate', dateRange),
      endDate: dateFromRangeToQuery('endDate', dateRange),
      excludeBots: newExcludeBots === undefined ? undefined : parseBooleanToString(newExcludeBots),
      orphanVisitsType: newOrphanVisitsType,
    };
    const stringifiedQuery = stringifyQuery(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(queryString, { replace: true, relative: 'route' });
  }, [filtering, navigate, rest]);

  return [filtering, updateFiltering];
};
