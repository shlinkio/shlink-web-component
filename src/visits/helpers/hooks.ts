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
      startDate: (dateRange?.startDate && formatIsoDate(dateRange.startDate)) || '',
      endDate: (dateRange?.endDate && formatIsoDate(dateRange.endDate)) || '',
      excludeBots: newExcludeBots === undefined ? undefined : parseBooleanToString(newExcludeBots),
      orphanVisitsType: newOrphanVisitsType,
    };
    const stringifiedQuery = stringifyQuery(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(queryString, { replace: true, relative: 'route' });
  }, [filtering, navigate, rest]);

  return [filtering, updateFiltering];
};
