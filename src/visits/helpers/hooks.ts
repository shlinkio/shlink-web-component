import type { DeepPartial } from '@reduxjs/toolkit';
import { stringifyQuery } from '@shlinkio/shlink-frontend-kit';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ShlinkOrphanVisitType } from '../../api-contract';
import { formatIsoDate } from '../../utils/dates/helpers/date';
import type { DateRange } from '../../utils/dates/helpers/dateIntervals';
import { datesToDateRange } from '../../utils/dates/helpers/dateIntervals';
import type { BooleanString } from '../../utils/helpers';
import { parseBooleanToString } from '../../utils/helpers';
import { mergeDeepRight } from '../../utils/helpers/data';
import { useParsedQuery } from '../../utils/helpers/hooks';
import type { VisitsFilter } from '../types';

interface VisitsQuery {
  startDate?: string;
  endDate?: string;
  orphanVisitsType?: ShlinkOrphanVisitType;
  excludeBots?: BooleanString;
  domain?: string;
}

interface VisitsFiltering {
  dateRange?: DateRange;
  visitsFilter: VisitsFilter;
}

interface VisitsFilteringAndDomain {
  filtering: VisitsFiltering;
  domain?: string;
}

type UpdateFiltering = (extra: DeepPartial<VisitsFiltering>) => void;

export const useVisitsQuery = (): [VisitsFiltering, UpdateFiltering] => {
  const navigate = useNavigate();
  const query = useParsedQuery<VisitsQuery>();

  const { filtering, domain: theDomain } = useMemo(
    (): VisitsFilteringAndDomain => {
      const { startDate, endDate, orphanVisitsType, excludeBots, domain } = query;
      return {
        domain,
        filtering: {
          dateRange: startDate != null || endDate != null ? datesToDateRange(startDate, endDate) : undefined,
          visitsFilter: {
            orphanVisitsType,
            excludeBots: excludeBots !== undefined ? excludeBots === 'true' : undefined,
          },
        },
      };
    },
    [query],
  );
  const updateFiltering = useCallback((extra: DeepPartial<VisitsFiltering>) => {
    const { dateRange, visitsFilter } = mergeDeepRight(filtering, extra);
    const { excludeBots, orphanVisitsType } = visitsFilter;
    const newQuery: VisitsQuery = {
      startDate: (dateRange?.startDate && formatIsoDate(dateRange.startDate)) || '',
      endDate: (dateRange?.endDate && formatIsoDate(dateRange.endDate)) || '',
      excludeBots: excludeBots === undefined ? undefined : parseBooleanToString(excludeBots),
      orphanVisitsType,
      domain: theDomain,
    };
    const stringifiedQuery = stringifyQuery(newQuery);
    const queryString = !stringifiedQuery ? '' : `?${stringifiedQuery}`;

    navigate(queryString, { replace: true, relative: 'route' });
  }, [filtering, navigate, theDomain]);

  return [filtering, updateFiltering];
};
